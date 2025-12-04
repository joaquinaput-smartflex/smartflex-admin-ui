'use client';

import { useEffect, useState } from 'react';
import {
  Title,
  Text,
  Stack,
  Card,
  Table,
  Badge,
  Group,
  Button,
  ActionIcon,
  Modal,
  TextInput,
  Select,
  Switch,
  Textarea,
  LoadingOverlay,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconPhone,
  IconMail,
  IconBuilding,
  IconUser,
  IconBell,
  IconBellOff,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { apiUrl } from '@/lib/client-api';

interface Customer {
  id: number;
  company_id: number | null;
  company_name: string | null;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  role: 'user' | 'owner' | 'readonly' | 'admin';
  notifications_enabled: boolean;
  language: string;
  notes: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface Company {
  id: number;
  name: string;
}

// Argentine phone formatting and validation
const formatArgentinePhone = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // If starts with 54, format as international
  if (digits.startsWith('54')) {
    const rest = digits.slice(2);
    if (rest.startsWith('9')) {
      // Mobile: +54 9 XX XXXX-XXXX
      const areaCode = rest.slice(1, 3);
      const firstPart = rest.slice(3, 7);
      const secondPart = rest.slice(7, 11);
      if (rest.length <= 3) return `+54 9 ${rest.slice(1)}`;
      if (rest.length <= 7) return `+54 9 ${areaCode} ${firstPart}`;
      return `+54 9 ${areaCode} ${firstPart}-${secondPart}`;
    } else {
      // Landline: +54 XX XXXX-XXXX
      const areaCode = rest.slice(0, 2);
      const firstPart = rest.slice(2, 6);
      const secondPart = rest.slice(6, 10);
      if (rest.length <= 2) return `+54 ${rest}`;
      if (rest.length <= 6) return `+54 ${areaCode} ${firstPart}`;
      return `+54 ${areaCode} ${firstPart}-${secondPart}`;
    }
  }

  // If starts with 9, assume mobile without country code
  if (digits.startsWith('9') && digits.length > 1) {
    const areaCode = digits.slice(1, 3);
    const firstPart = digits.slice(3, 7);
    const secondPart = digits.slice(7, 11);
    if (digits.length <= 3) return `+54 9 ${digits.slice(1)}`;
    if (digits.length <= 7) return `+54 9 ${areaCode} ${firstPart}`;
    return `+54 9 ${areaCode} ${firstPart}-${secondPart}`;
  }

  // Default: add +54 9 prefix for mobile
  if (digits.length >= 2) {
    const areaCode = digits.slice(0, 2);
    const firstPart = digits.slice(2, 6);
    const secondPart = digits.slice(6, 10);
    if (digits.length <= 2) return `+54 9 ${digits}`;
    if (digits.length <= 6) return `+54 9 ${areaCode} ${firstPart}`;
    return `+54 9 ${areaCode} ${firstPart}-${secondPart}`;
  }

  return digits ? `+54 9 ${digits}` : '';
};

const normalizePhone = (phone: string): string => {
  // Remove all non-digits and return clean number
  const digits = phone.replace(/\D/g, '');
  // Ensure it starts with 54
  if (!digits.startsWith('54') && digits.length > 0) {
    return '54' + (digits.startsWith('9') ? digits : '9' + digits);
  }
  return digits;
};

const validateArgentinePhone = (value: string): string | null => {
  const digits = value.replace(/\D/g, '');

  if (!digits) return 'El teléfono es requerido';

  // Argentine mobile: 54 9 XX XXXX XXXX (13 digits)
  // Argentine landline: 54 XX XXXX XXXX (12 digits)
  if (digits.length < 12) return 'Teléfono incompleto (mínimo 10 dígitos sin prefijo)';
  if (digits.length > 13) return 'Teléfono demasiado largo';

  if (!digits.startsWith('54')) return 'Debe ser un número argentino (+54)';

  return null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter customers based on search query
  const filteredCustomers = customers.filter((customer) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.first_name.toLowerCase().includes(query) ||
      customer.last_name.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      (customer.email?.toLowerCase().includes(query) ?? false) ||
      (customer.company_name?.toLowerCase().includes(query) ?? false)
    );
  });

  const form = useForm({
    initialValues: {
      company_id: '',
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      role: 'user',
      notifications_enabled: true,
      language: 'es',
      notes: '',
      status: 'active',
    },
    validate: {
      first_name: (value) => (!value ? 'El nombre es requerido' : null),
      last_name: (value) => (!value ? 'El apellido es requerido' : null),
      phone: validateArgentinePhone,
      email: (value) =>
        value && !/^\S+@\S+$/.test(value) ? 'Email inválido' : null,
    },
  });

  const loadCustomers = async () => {
    try {
      const response = await fetch(apiUrl('/api/customers'));
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const response = await fetch(apiUrl('/api/companies'));
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  useEffect(() => {
    loadCustomers();
    loadCompanies();
  }, []);

  const handleCreate = () => {
    setSelectedCustomer(null);
    form.reset();
    form.setFieldValue('role', 'user');
    form.setFieldValue('status', 'active');
    form.setFieldValue('notifications_enabled', true);
    form.setFieldValue('language', 'es');
    openModal();
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.setValues({
      company_id: customer.company_id?.toString() || '',
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone: formatArgentinePhone(customer.phone),
      email: customer.email || '',
      role: customer.role,
      notifications_enabled: customer.notifications_enabled,
      language: customer.language || 'es',
      notes: customer.notes || '',
      status: customer.status,
    });
    openModal();
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatArgentinePhone(value);
    form.setFieldValue('phone', formatted);
  };

  const handleSubmit = async (values: typeof form.values) => {
    setSaving(true);
    try {
      const url = selectedCustomer
        ? apiUrl(`/api/customers/${selectedCustomer.id}`)
        : apiUrl('/api/customers');
      const method = selectedCustomer ? 'PUT' : 'POST';

      // Normalize phone before sending
      const payload = {
        ...values,
        company_id: values.company_id ? parseInt(values.company_id) : null,
        phone: normalizePhone(values.phone),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        notifications.show({
          title: 'Error',
          message: data.error || 'Error al guardar contacto',
          color: 'red',
        });
        return;
      }

      notifications.show({
        title: 'Éxito',
        message: selectedCustomer ? 'Contacto actualizado' : 'Contacto creado',
        color: 'green',
      });

      closeModal();
      loadCustomers();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Error de conexión',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) return;

    try {
      const response = await fetch(apiUrl(`/api/customers/${selectedCustomer.id}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        notifications.show({
          title: 'Error',
          message: data.error || 'Error al eliminar contacto',
          color: 'red',
        });
        return;
      }

      notifications.show({
        title: 'Éxito',
        message: 'Contacto eliminado',
        color: 'green',
      });

      closeDelete();
      loadCustomers();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Error de conexión',
        color: 'red',
      });
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge color="grape" variant="light">Administrador</Badge>;
      case 'owner':
        return <Badge color="blue" variant="light">Propietario</Badge>;
      case 'user':
        return <Badge color="cyan" variant="light">Operador</Badge>;
      case 'readonly':
        return <Badge color="gray" variant="light">Solo Lectura</Badge>;
      default:
        return <Badge color="gray" variant="light">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge color="green" variant="light">Activo</Badge>;
      case 'inactive':
        return <Badge color="gray" variant="light">Inactivo</Badge>;
      default:
        return <Badge color="gray" variant="light">{status}</Badge>;
    }
  };

  const formatPhoneDisplay = (phone: string): string => {
    if (!phone) return '-';
    // If already formatted, return as is
    if (phone.includes('+')) return phone;
    // Format for display
    return formatArgentinePhone(phone);
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Contactos</Title>
          <Text c="dimmed">Gestión de contactos de empresas (usuarios WhatsApp)</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={handleCreate}>
          Nuevo Contacto
        </Button>
      </Group>

      {/* Search/Filter */}
      <Group>
        <TextInput
          placeholder="Buscar por nombre, teléfono, email o empresa..."
          leftSection={<IconSearch size={16} />}
          rightSection={
            searchQuery ? (
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() => setSearchQuery('')}
              >
                <IconX size={14} />
              </ActionIcon>
            ) : null
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1, maxWidth: 400 }}
        />
        {searchQuery && (
          <Text size="sm" c="dimmed">
            {filteredCustomers.length} de {customers.length} contactos
          </Text>
        )}
      </Group>

      <Card pos="relative">
        <LoadingOverlay visible={loading} />
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Contacto</Table.Th>
              <Table.Th>Empresa</Table.Th>
              <Table.Th>Teléfono</Table.Th>
              <Table.Th>Rol</Table.Th>
              <Table.Th>Notif.</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredCustomers.map((customer) => (
              <Table.Tr key={customer.id}>
                <Table.Td>
                  <Group gap="xs">
                    <IconUser size={20} color="var(--mantine-color-cyan-6)" />
                    <div>
                      <Text fw={500}>{customer.first_name} {customer.last_name}</Text>
                      {customer.email && (
                        <Group gap={4}>
                          <IconMail size={12} color="var(--mantine-color-dimmed)" />
                          <Text size="xs" c="dimmed">{customer.email}</Text>
                        </Group>
                      )}
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  {customer.company_name ? (
                    <Group gap={4}>
                      <IconBuilding size={14} />
                      <Text size="sm">{customer.company_name}</Text>
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed">Sin empresa</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <IconPhone size={14} color="var(--mantine-color-green-6)" />
                    <Text size="sm" ff="monospace">{formatPhoneDisplay(customer.phone)}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>{getRoleBadge(customer.role)}</Table.Td>
                <Table.Td>
                  {customer.notifications_enabled ? (
                    <Tooltip label="Notificaciones activas">
                      <IconBell size={18} color="var(--mantine-color-green-6)" />
                    </Tooltip>
                  ) : (
                    <Tooltip label="Notificaciones desactivadas">
                      <IconBellOff size={18} color="var(--mantine-color-gray-6)" />
                    </Tooltip>
                  )}
                </Table.Td>
                <Table.Td>{getStatusBadge(customer.status)}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Tooltip label="Editar">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEdit(customer)}
                      >
                        <IconEdit size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          openDelete();
                        }}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {filteredCustomers.length === 0 && !loading && (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text ta="center" c="dimmed" py="xl">
                    {searchQuery
                      ? `No se encontraron contactos para "${searchQuery}"`
                      : 'No hay contactos registrados'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={selectedCustomer ? 'Editar Contacto' : 'Nuevo Contacto'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Select
              label="Empresa"
              placeholder="Seleccionar empresa"
              leftSection={<IconBuilding size={16} />}
              data={companies.map((c) => ({ value: c.id.toString(), label: c.name }))}
              {...form.getInputProps('company_id')}
              clearable
            />

            <Group grow>
              <TextInput
                label="Nombre"
                placeholder="Juan"
                {...form.getInputProps('first_name')}
                required
              />
              <TextInput
                label="Apellido"
                placeholder="Pérez"
                {...form.getInputProps('last_name')}
                required
              />
            </Group>

            <TextInput
              label="Teléfono (Argentina)"
              placeholder="+54 9 11 1234-5678"
              description="Formato: +54 9 [código área] [número]. Ej: +54 9 11 1234-5678"
              leftSection={<IconPhone size={16} />}
              value={form.values.phone}
              onChange={(e) => handlePhoneChange(e.currentTarget.value)}
              error={form.errors.phone}
              required
            />

            <TextInput
              label="Email"
              placeholder="contacto@empresa.com"
              leftSection={<IconMail size={16} />}
              {...form.getInputProps('email')}
            />

            <Group grow>
              <Select
                label="Rol"
                description="Define qué puede hacer el contacto"
                data={[
                  { value: 'user', label: 'Operador - Estado + Comandos' },
                  { value: 'owner', label: 'Propietario - Estado + Reportes' },
                  { value: 'readonly', label: 'Solo Lectura - Solo Estado' },
                  { value: 'admin', label: 'Administrador - Acceso Total' },
                ]}
                {...form.getInputProps('role')}
                required
              />
              <Select
                label="Estado"
                data={[
                  { value: 'active', label: 'Activo' },
                  { value: 'inactive', label: 'Inactivo' },
                ]}
                {...form.getInputProps('status')}
              />
            </Group>

            <Group grow>
              <Select
                label="Idioma"
                data={[
                  { value: 'es', label: 'Español' },
                  { value: 'en', label: 'English' },
                ]}
                {...form.getInputProps('language')}
              />
              <Switch
                label="Notificaciones WhatsApp"
                description="Recibir alertas automáticas"
                {...form.getInputProps('notifications_enabled', { type: 'checkbox' })}
                mt="md"
              />
            </Group>

            <Textarea
              label="Notas"
              placeholder="Observaciones adicionales..."
              minRows={2}
              {...form.getInputProps('notes')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={closeModal} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                {selectedCustomer ? 'Guardar' : 'Crear'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title="Confirmar Eliminación"
        size="sm"
      >
        <Stack gap="md">
          <Text>
            ¿Estás seguro de eliminar al contacto{' '}
            <strong>{selectedCustomer?.first_name} {selectedCustomer?.last_name}</strong>?
          </Text>
          <Text size="sm" c="dimmed">
            Esta acción eliminará también los permisos de dispositivos asociados.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeDelete}>
              Cancelar
            </Button>
            <Button color="red" onClick={handleDelete}>
              Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

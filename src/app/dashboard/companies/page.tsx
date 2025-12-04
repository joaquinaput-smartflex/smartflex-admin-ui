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
  Textarea,
  Select,
  LoadingOverlay,
  Grid,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconBuilding,
  IconPhone,
  IconMail,
  IconMapPin,
  IconUsers,
  IconDevices,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { apiUrl } from '@/lib/client-api';

interface Company {
  id: number;
  name: string;
  tax_id: string | null;
  tax_condition: 'consumidor_final' | 'responsable_inscripto' | 'iva_exento' | 'monotributista' | 'no_responsable';
  address: string | null;
  city: string | null;
  province: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  contact_person: string | null;
  notes: string | null;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter companies based on search query
  const filteredCompanies = companies.filter((company) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    return (
      company.name.toLowerCase().includes(query) ||
      (company.tax_id?.toLowerCase().includes(query) ?? false) ||
      (company.contact_person?.toLowerCase().includes(query) ?? false) ||
      (company.phone?.includes(query) ?? false) ||
      (company.email?.toLowerCase().includes(query) ?? false) ||
      (company.city?.toLowerCase().includes(query) ?? false) ||
      (company.province?.toLowerCase().includes(query) ?? false) ||
      (company.tax_condition?.toLowerCase().includes(query) ?? false)
    );
  });

  const form = useForm({
    initialValues: {
      name: '',
      tax_id: '',
      tax_condition: 'consumidor_final',
      address: '',
      city: '',
      province: '',
      country: 'Argentina',
      phone: '',
      email: '',
      contact_person: '',
      notes: '',
      status: 'active',
    },
    validate: {
      name: (value) => (!value ? 'El nombre es requerido' : null),
      email: (value) =>
        value && !/^\S+@\S+$/.test(value) ? 'Email inválido' : null,
    },
  });

  const loadCompanies = async () => {
    try {
      const response = await fetch(apiUrl('/api/companies'));
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleCreate = () => {
    setSelectedCompany(null);
    form.reset();
    form.setFieldValue('country', 'Argentina');
    form.setFieldValue('tax_condition', 'consumidor_final');
    form.setFieldValue('status', 'active');
    openModal();
  };

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    form.setValues({
      name: company.name,
      tax_id: company.tax_id || '',
      tax_condition: company.tax_condition || 'consumidor_final',
      address: company.address || '',
      city: company.city || '',
      province: company.province || '',
      country: company.country || 'Argentina',
      phone: company.phone || '',
      email: company.email || '',
      contact_person: company.contact_person || '',
      notes: company.notes || '',
      status: company.status,
    });
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setSaving(true);
    try {
      const url = selectedCompany
        ? apiUrl(`/api/companies/${selectedCompany.id}`)
        : apiUrl('/api/companies');
      const method = selectedCompany ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        notifications.show({
          title: 'Error',
          message: data.error || 'Error al guardar empresa',
          color: 'red',
        });
        return;
      }

      notifications.show({
        title: 'Éxito',
        message: selectedCompany ? 'Empresa actualizada' : 'Empresa creada',
        color: 'green',
      });

      closeModal();
      loadCompanies();
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
    if (!selectedCompany) return;

    try {
      const response = await fetch(apiUrl(`/api/companies/${selectedCompany.id}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        notifications.show({
          title: 'Error',
          message: data.error || 'Error al eliminar empresa',
          color: 'red',
        });
        return;
      }

      notifications.show({
        title: 'Éxito',
        message: 'Empresa eliminada',
        color: 'green',
      });

      closeDelete();
      loadCompanies();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Error de conexión',
        color: 'red',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge color="green" variant="light">Activa</Badge>;
      case 'inactive':
        return <Badge color="gray" variant="light">Inactiva</Badge>;
      case 'suspended':
        return <Badge color="red" variant="light">Suspendida</Badge>;
      default:
        return <Badge color="gray" variant="light">{status}</Badge>;
    }
  };

  const getTaxConditionLabel = (condition: string) => {
    switch (condition) {
      case 'consumidor_final':
        return 'Cons. Final';
      case 'responsable_inscripto':
        return 'Resp. Inscripto';
      case 'iva_exento':
        return 'IVA Exento';
      case 'monotributista':
        return 'Monotributo';
      case 'no_responsable':
        return 'No Resp.';
      default:
        return condition || '-';
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Empresas</Title>
          <Text c="dimmed">Gestión de empresas clientes</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={handleCreate}>
          Nueva Empresa
        </Button>
      </Group>

      {/* Search/Filter */}
      <Group>
        <TextInput
          placeholder="Buscar por nombre, CUIT, contacto, teléfono, email o ciudad..."
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
            {filteredCompanies.length} de {companies.length} empresas
          </Text>
        )}
      </Group>

      <Card pos="relative">
        <LoadingOverlay visible={loading} />
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Empresa</Table.Th>
              <Table.Th>CUIT</Table.Th>
              <Table.Th>Cond. IVA</Table.Th>
              <Table.Th>Contacto</Table.Th>
              <Table.Th>Ubicación</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredCompanies.map((company) => (
              <Table.Tr key={company.id}>
                <Table.Td>
                  <Group gap="xs">
                    <IconBuilding size={20} color="var(--mantine-color-blue-6)" />
                    <div>
                      <Text fw={500}>{company.name}</Text>
                      {company.contact_person && (
                        <Text size="xs" c="dimmed">{company.contact_person}</Text>
                      )}
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" ff="monospace">{company.tax_id || '-'}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{getTaxConditionLabel(company.tax_condition)}</Text>
                </Table.Td>
                <Table.Td>
                  <Stack gap={2}>
                    {company.phone && (
                      <Group gap={4}>
                        <IconPhone size={14} />
                        <Text size="sm">{company.phone}</Text>
                      </Group>
                    )}
                    {company.email && (
                      <Group gap={4}>
                        <IconMail size={14} />
                        <Text size="sm">{company.email}</Text>
                      </Group>
                    )}
                    {!company.phone && !company.email && (
                      <Text size="sm" c="dimmed">-</Text>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  {company.city || company.province ? (
                    <Group gap={4}>
                      <IconMapPin size={14} />
                      <Text size="sm">
                        {[company.city, company.province].filter(Boolean).join(', ')}
                      </Text>
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed">-</Text>
                  )}
                </Table.Td>
                <Table.Td>{getStatusBadge(company.status)}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Tooltip label="Ver Contactos">
                      <ActionIcon
                        variant="subtle"
                        color="cyan"
                        onClick={() => {
                          // TODO: Navigate to customers filtered by company
                          notifications.show({
                            title: 'Próximamente',
                            message: 'Ver contactos de la empresa',
                            color: 'blue',
                          });
                        }}
                      >
                        <IconUsers size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Ver Dispositivos">
                      <ActionIcon
                        variant="subtle"
                        color="teal"
                        onClick={() => {
                          // TODO: Navigate to devices filtered by company
                          notifications.show({
                            title: 'Próximamente',
                            message: 'Ver dispositivos de la empresa',
                            color: 'blue',
                          });
                        }}
                      >
                        <IconDevices size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Editar">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEdit(company)}
                      >
                        <IconEdit size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => {
                          setSelectedCompany(company);
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
            {filteredCompanies.length === 0 && !loading && (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text ta="center" c="dimmed" py="xl">
                    {searchQuery
                      ? `No se encontraron empresas para "${searchQuery}"`
                      : 'No hay empresas registradas'}
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
        title={selectedCompany ? 'Editar Empresa' : 'Nueva Empresa'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Nombre de la Empresa"
                  placeholder="Empresa S.A."
                  leftSection={<IconBuilding size={16} />}
                  {...form.getInputProps('name')}
                  required
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <TextInput
                  label="CUIT"
                  placeholder="30-12345678-9"
                  {...form.getInputProps('tax_id')}
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <Select
                  label="Condición IVA"
                  data={[
                    { value: 'consumidor_final', label: 'Consumidor Final' },
                    { value: 'responsable_inscripto', label: 'Responsable Inscripto' },
                    { value: 'iva_exento', label: 'IVA Exento' },
                    { value: 'monotributista', label: 'Monotributista' },
                    { value: 'no_responsable', label: 'No Responsable' },
                  ]}
                  {...form.getInputProps('tax_condition')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Persona de Contacto"
                  placeholder="Juan Pérez"
                  {...form.getInputProps('contact_person')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Teléfono"
                  placeholder="+54 9 11 1234-5678"
                  leftSection={<IconPhone size={16} />}
                  {...form.getInputProps('phone')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Email"
              placeholder="contacto@empresa.com"
              leftSection={<IconMail size={16} />}
              {...form.getInputProps('email')}
            />

            <TextInput
              label="Dirección"
              placeholder="Av. Corrientes 1234"
              leftSection={<IconMapPin size={16} />}
              {...form.getInputProps('address')}
            />

            <Grid>
              <Grid.Col span={4}>
                <TextInput
                  label="Ciudad"
                  placeholder="Buenos Aires"
                  {...form.getInputProps('city')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="Provincia"
                  placeholder="Buenos Aires"
                  {...form.getInputProps('province')}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <TextInput
                  label="País"
                  placeholder="Argentina"
                  {...form.getInputProps('country')}
                />
              </Grid.Col>
            </Grid>

            <Select
              label="Estado"
              data={[
                { value: 'active', label: 'Activa' },
                { value: 'inactive', label: 'Inactiva' },
                { value: 'suspended', label: 'Suspendida' },
              ]}
              {...form.getInputProps('status')}
            />

            <Textarea
              label="Notas"
              placeholder="Observaciones adicionales..."
              minRows={3}
              {...form.getInputProps('notes')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={closeModal} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                {selectedCompany ? 'Guardar' : 'Crear'}
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
            ¿Estás seguro de eliminar la empresa <strong>{selectedCompany?.name}</strong>?
          </Text>
          <Text size="sm" c="dimmed">
            Esta acción eliminará también todos los contactos y dispositivos asociados.
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

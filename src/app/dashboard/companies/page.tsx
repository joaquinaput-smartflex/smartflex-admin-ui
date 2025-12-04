'use client';

import { useEffect, useState, useCallback } from 'react';
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
  Collapse,
  Box,
  Paper,
  Tabs,
  Checkbox,
  Loader,
  ThemeIcon,
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
  IconChevronDown,
  IconChevronRight,
  IconCircleCheck,
  IconWifi,
  IconWifiOff,
  IconUserPlus,
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

interface Contact {
  id: number;
  company_id: number | null;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  role: string;
  notifications_enabled: boolean;
  status: string;
}

interface Device {
  id: number;
  device_id: string;
  name: string | null;
  location: string | null;
  online: boolean;
  status: string;
}

interface Permission {
  id: number;
  customer_id: number;
  device_id: number;
  device_db_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  device_name: string | null;
  can_view: boolean;
  can_control: boolean;
  can_configure: boolean;
  receive_alerts: boolean;
}

interface ExpandedData {
  contacts: Contact[];
  devices: Device[];
  permissions: Permission[];
  loading: boolean;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [contactModalOpened, { open: openContactModal, close: closeContactModal }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [expandedData, setExpandedData] = useState<Record<number, ExpandedData>>({});

  // Search within expanded sections
  const [expandedSearch, setExpandedSearch] = useState<Record<number, string>>({});

  // New contact form for inline creation
  const contactForm = useForm({
    initialValues: {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      role: 'user',
    },
    validate: {
      first_name: (value) => (!value ? 'Nombre requerido' : null),
      last_name: (value) => (!value ? 'Apellido requerido' : null),
      phone: (value) => (!value ? 'Teléfono requerido' : null),
    },
  });

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

  // Load expanded data for a company
  const loadExpandedData = useCallback(async (companyId: number) => {
    setExpandedData((prev) => ({
      ...prev,
      [companyId]: { contacts: [], devices: [], permissions: [], loading: true },
    }));

    try {
      const [contactsRes, devicesRes, permissionsRes] = await Promise.all([
        fetch(apiUrl(`/api/companies/${companyId}/contacts`)),
        fetch(apiUrl(`/api/companies/${companyId}/devices`)),
        fetch(apiUrl(`/api/companies/${companyId}/permissions`)),
      ]);

      const [contacts, devices, permissions] = await Promise.all([
        contactsRes.ok ? contactsRes.json() : [],
        devicesRes.ok ? devicesRes.json() : [],
        permissionsRes.ok ? permissionsRes.json() : [],
      ]);

      setExpandedData((prev) => ({
        ...prev,
        [companyId]: {
          contacts: contacts || [],
          devices: devices || [],
          permissions: permissions || [],
          loading: false,
        },
      }));
    } catch (error) {
      console.error('Error loading expanded data:', error);
      setExpandedData((prev) => ({
        ...prev,
        [companyId]: { contacts: [], devices: [], permissions: [], loading: false },
      }));
    }
  }, []);

  // Toggle row expansion
  const toggleRow = useCallback((companyId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
        // Load data when expanding
        if (!expandedData[companyId] || expandedData[companyId].loading === false) {
          loadExpandedData(companyId);
        }
      }
      return newSet;
    });
  }, [expandedData, loadExpandedData]);

  // Check if a contact is subscribed to a device
  const isSubscribed = (companyId: number, contactId: number, deviceDbId: number): boolean => {
    const data = expandedData[companyId];
    if (!data) return false;
    return data.permissions.some(
      (p) => p.customer_id === contactId && p.device_db_id === deviceDbId
    );
  };

  // Get subscribed devices for a contact
  const getContactSubscriptions = (companyId: number, contactId: number): Permission[] => {
    const data = expandedData[companyId];
    if (!data) return [];
    return data.permissions.filter((p) => p.customer_id === contactId);
  };

  // Toggle subscription
  const toggleSubscription = async (companyId: number, contactId: number, deviceDbId: number) => {
    const subscribed = isSubscribed(companyId, contactId, deviceDbId);

    try {
      if (subscribed) {
        // Delete subscription
        const response = await fetch(
          apiUrl(`/api/permissions?customer_id=${contactId}&device_id=${deviceDbId}`),
          { method: 'DELETE' }
        );
        if (!response.ok) throw new Error('Error removing subscription');

        notifications.show({
          title: 'Suscripción eliminada',
          message: 'El contacto ya no recibirá notificaciones de este dispositivo',
          color: 'orange',
        });
      } else {
        // Create subscription
        const response = await fetch(apiUrl('/api/permissions'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: contactId,
            device_id: deviceDbId,
            can_view: true,
            can_control: true,
            can_configure: false,
            receive_alerts: true,
          }),
        });
        if (!response.ok) throw new Error('Error creating subscription');

        notifications.show({
          title: 'Suscripción creada',
          message: 'El contacto recibirá notificaciones de este dispositivo',
          color: 'green',
        });
      }

      // Reload data
      loadExpandedData(companyId);
    } catch {
      notifications.show({
        title: 'Error',
        message: 'No se pudo actualizar la suscripción',
        color: 'red',
      });
    }
  };

  // Create new contact inline
  const handleCreateContact = async (companyId: number) => {
    setSaving(true);
    try {
      const response = await fetch(apiUrl('/api/customers'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactForm.values,
          company_id: companyId,
          status: 'active',
          notifications_enabled: true,
          language: 'es',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error creating contact');
      }

      notifications.show({
        title: 'Contacto creado',
        message: `${contactForm.values.first_name} ${contactForm.values.last_name} agregado`,
        color: 'green',
      });

      contactForm.reset();
      closeContactModal();
      loadExpandedData(companyId);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error de conexión',
        color: 'red',
      });
    } finally {
      setSaving(false);
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

  // Filter contacts/devices within expanded section
  const filterExpandedItems = <T extends { first_name?: string; last_name?: string; phone?: string; name?: string | null; device_id?: string }>(
    items: T[],
    query: string
  ): T[] => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((item) => {
      const name = item.name?.toLowerCase() || '';
      const deviceId = item.device_id?.toLowerCase() || '';
      const firstName = item.first_name?.toLowerCase() || '';
      const lastName = item.last_name?.toLowerCase() || '';
      const phone = item.phone || '';
      return (
        name.includes(q) ||
        deviceId.includes(q) ||
        firstName.includes(q) ||
        lastName.includes(q) ||
        phone.includes(q)
      );
    });
  };

  // Render expanded content for a company
  const renderExpandedContent = (company: Company) => {
    const data = expandedData[company.id];
    const searchTerm = expandedSearch[company.id] || '';

    if (!data || data.loading) {
      return (
        <Box p="md" ta="center">
          <Loader size="sm" />
          <Text size="sm" c="dimmed" mt="xs">Cargando datos...</Text>
        </Box>
      );
    }

    const filteredContacts = filterExpandedItems(data.contacts, searchTerm);
    const filteredDevices = filterExpandedItems(data.devices, searchTerm);

    return (
      <Paper p="md" bg="gray.0" withBorder={false}>
        {/* Search within expanded section */}
        <Group mb="md">
          <TextInput
            placeholder="Buscar contactos o dispositivos..."
            size="xs"
            leftSection={<IconSearch size={14} />}
            value={searchTerm}
            onChange={(e) =>
              setExpandedSearch((prev) => ({
                ...prev,
                [company.id]: e.currentTarget.value,
              }))
            }
            style={{ flex: 1, maxWidth: 300 }}
            rightSection={
              searchTerm ? (
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  onClick={() =>
                    setExpandedSearch((prev) => ({ ...prev, [company.id]: '' }))
                  }
                >
                  <IconX size={12} />
                </ActionIcon>
              ) : null
            }
          />
          <Button
            size="xs"
            variant="light"
            leftSection={<IconUserPlus size={14} />}
            onClick={() => {
              setSelectedCompany(company);
              contactForm.reset();
              openContactModal();
            }}
          >
            Nuevo Contacto
          </Button>
        </Group>

        <Tabs defaultValue="contacts">
          <Tabs.List>
            <Tabs.Tab value="contacts" leftSection={<IconUsers size={14} />}>
              Contactos ({filteredContacts.length})
            </Tabs.Tab>
            <Tabs.Tab value="devices" leftSection={<IconDevices size={14} />}>
              Dispositivos ({filteredDevices.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="contacts" pt="md">
            {filteredContacts.length === 0 ? (
              <Text c="dimmed" size="sm" ta="center" py="md">
                No hay contactos para esta empresa
              </Text>
            ) : (
              <Stack gap="xs">
                {filteredContacts.map((contact) => {
                  const subscriptions = getContactSubscriptions(company.id, contact.id);
                  return (
                    <Paper key={contact.id} p="sm" withBorder>
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="xs">
                          <ThemeIcon size="sm" variant="light" color="cyan">
                            <IconUsers size={14} />
                          </ThemeIcon>
                          <div>
                            <Text size="sm" fw={500}>
                              {contact.first_name} {contact.last_name}
                            </Text>
                            <Group gap="xs">
                              <Text size="xs" c="dimmed">
                                <IconPhone size={10} style={{ marginRight: 2 }} />
                                {contact.phone}
                              </Text>
                              {contact.email && (
                                <Text size="xs" c="dimmed">
                                  <IconMail size={10} style={{ marginRight: 2 }} />
                                  {contact.email}
                                </Text>
                              )}
                            </Group>
                          </div>
                        </Group>

                        {/* Subscribed devices badges */}
                        <Group gap={4}>
                          {subscriptions.length > 0 ? (
                            subscriptions.map((sub) => (
                              <Tooltip
                                key={`${sub.customer_id}-${sub.device_db_id}`}
                                label={`Suscrito a ${sub.device_name || 'Dispositivo'} - Click para desuscribir`}
                              >
                                <Badge
                                  size="xs"
                                  color="teal"
                                  variant="light"
                                  style={{ cursor: 'pointer' }}
                                  rightSection={<IconCircleCheck size={10} />}
                                  onClick={() =>
                                    toggleSubscription(company.id, contact.id, sub.device_db_id)
                                  }
                                >
                                  {sub.device_name || 'Dispositivo'}
                                </Badge>
                              </Tooltip>
                            ))
                          ) : (
                            <Text size="xs" c="dimmed" fs="italic">
                              Sin suscripciones
                            </Text>
                          )}
                        </Group>
                      </Group>

                      {/* Device subscription toggles */}
                      {data.devices.length > 0 && (
                        <Group mt="xs" gap="xs">
                          <Text size="xs" c="dimmed">Suscribir a:</Text>
                          {data.devices.map((device) => {
                            const subscribed = isSubscribed(company.id, contact.id, device.id);
                            return (
                              <Tooltip
                                key={device.id}
                                label={subscribed ? 'Desuscribir' : 'Suscribir'}
                              >
                                <Checkbox
                                  size="xs"
                                  label={device.name || device.device_id.substring(0, 12)}
                                  checked={subscribed}
                                  onChange={() =>
                                    toggleSubscription(company.id, contact.id, device.id)
                                  }
                                />
                              </Tooltip>
                            );
                          })}
                        </Group>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="devices" pt="md">
            {filteredDevices.length === 0 ? (
              <Text c="dimmed" size="sm" ta="center" py="md">
                No hay dispositivos asignados a esta empresa
              </Text>
            ) : (
              <Stack gap="xs">
                {filteredDevices.map((device) => {
                  // Find contacts subscribed to this device
                  const subscribedContacts = data.permissions.filter(
                    (p) => p.device_db_id === device.id
                  );

                  return (
                    <Paper key={device.id} p="sm" withBorder>
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="xs">
                          <ThemeIcon
                            size="sm"
                            variant="light"
                            color={device.online ? 'green' : 'gray'}
                          >
                            {device.online ? <IconWifi size={14} /> : <IconWifiOff size={14} />}
                          </ThemeIcon>
                          <div>
                            <Text size="sm" fw={500}>
                              {device.name || device.device_id}
                            </Text>
                            {device.location && (
                              <Text size="xs" c="dimmed">
                                <IconMapPin size={10} style={{ marginRight: 2 }} />
                                {device.location}
                              </Text>
                            )}
                          </div>
                        </Group>

                        <Badge
                          color={device.online ? 'green' : 'gray'}
                          variant="light"
                          size="sm"
                        >
                          {device.online ? 'Online' : 'Offline'}
                        </Badge>
                      </Group>

                      {/* Subscribed contacts */}
                      <Group mt="xs" gap="xs">
                        <Text size="xs" c="dimmed">Contactos suscritos:</Text>
                        {subscribedContacts.length > 0 ? (
                          subscribedContacts.map((sub) => (
                            <Tooltip
                              key={`${sub.customer_id}-${sub.device_db_id}`}
                              label="Click para desuscribir"
                            >
                              <Badge
                                size="xs"
                                color="cyan"
                                variant="light"
                                style={{ cursor: 'pointer' }}
                                rightSection={<IconX size={10} />}
                                onClick={() =>
                                  toggleSubscription(company.id, sub.customer_id, device.id)
                                }
                              >
                                {sub.first_name} {sub.last_name}
                              </Badge>
                            </Tooltip>
                          ))
                        ) : (
                          <Text size="xs" c="dimmed" fs="italic">
                            Ninguno
                          </Text>
                        )}
                      </Group>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Tabs.Panel>
        </Tabs>
      </Paper>
    );
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
              <Table.Th style={{ width: 40 }}></Table.Th>
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
            {filteredCompanies.map((company) => {
              const isExpanded = expandedRows.has(company.id);
              return (
                <>
                  <Table.Tr
                    key={company.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleRow(company.id)}
                  >
                    <Table.Td>
                      <ActionIcon variant="subtle" size="sm">
                        {isExpanded ? (
                          <IconChevronDown size={16} />
                        ) : (
                          <IconChevronRight size={16} />
                        )}
                      </ActionIcon>
                    </Table.Td>
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
                      <Group gap="xs" onClick={(e) => e.stopPropagation()}>
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
                  {isExpanded && (
                    <Table.Tr key={`${company.id}-expanded`}>
                      <Table.Td colSpan={8} p={0}>
                        <Collapse in={isExpanded}>
                          {renderExpandedContent(company)}
                        </Collapse>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </>
              );
            })}
            {filteredCompanies.length === 0 && !loading && (
              <Table.Tr>
                <Table.Td colSpan={8}>
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

      {/* Create/Edit Company Modal */}
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

      {/* New Contact Modal */}
      <Modal
        opened={contactModalOpened}
        onClose={closeContactModal}
        title={`Nuevo Contacto - ${selectedCompany?.name || ''}`}
        size="md"
      >
        <form
          onSubmit={contactForm.onSubmit(() => {
            if (selectedCompany) {
              handleCreateContact(selectedCompany.id);
            }
          })}
        >
          <Stack gap="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Nombre"
                  placeholder="Juan"
                  required
                  {...contactForm.getInputProps('first_name')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Apellido"
                  placeholder="Pérez"
                  required
                  {...contactForm.getInputProps('last_name')}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Teléfono (WhatsApp)"
              placeholder="+5491112345678"
              leftSection={<IconPhone size={16} />}
              required
              {...contactForm.getInputProps('phone')}
            />

            <TextInput
              label="Email"
              placeholder="juan@empresa.com"
              leftSection={<IconMail size={16} />}
              {...contactForm.getInputProps('email')}
            />

            <Select
              label="Rol"
              data={[
                { value: 'user', label: 'Usuario' },
                { value: 'owner', label: 'Propietario' },
                { value: 'admin', label: 'Administrador' },
                { value: 'readonly', label: 'Solo Lectura' },
              ]}
              {...contactForm.getInputProps('role')}
            />

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={closeContactModal} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                Crear Contacto
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}

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
  Textarea,
  LoadingOverlay,
  Tooltip,
  Tabs,
  NumberInput,
  Grid,
  Indicator,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconDevices,
  IconBuilding,
  IconMapPin,
  IconCpu,
  IconSearch,
  IconX,
  IconWifi,
  IconWifiOff,
  IconSettings,
  IconInfoCircle,
  IconAntenna,
  IconPlayerPlay,
  IconExternalLink,
} from '@tabler/icons-react';
import { apiUrl } from '@/lib/client-api';

interface Device {
  id: number;
  device_id: string;
  company_id: number | null;
  company_name: string | null;
  name: string | null;
  location: string | null;
  model: string;
  firmware_version: string | null;
  imei: string | null;
  mac_address: string | null;
  sim_number: string | null;
  sim_carrier: string | null;
  relay_count: number;
  relay_labels: string[] | string | null;  // Can be JSON string from MySQL
  input_count: number;
  input_labels: string[] | string | null;  // Can be JSON string from MySQL
  notes: string | null;
  status: 'active' | 'inactive' | 'maintenance';
  last_seen: string | null;
  online: boolean;
  relays?: number[];
  created_at: string;
  updated_at: string;
}

interface Company {
  id: number;
  name: string;
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [controlOpened, { open: openControl, close: closeControl }] = useDisclosure(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter devices based on search query
  const filteredDevices = devices.filter((device) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    return (
      device.device_id.toLowerCase().includes(query) ||
      (device.name?.toLowerCase().includes(query) ?? false) ||
      (device.location?.toLowerCase().includes(query) ?? false) ||
      (device.imei?.includes(query) ?? false) ||
      (device.company_name?.toLowerCase().includes(query) ?? false) ||
      (device.sim_carrier?.toLowerCase().includes(query) ?? false)
    );
  });

  const form = useForm({
    initialValues: {
      device_id: '',
      company_id: '',
      name: '',
      location: '',
      model: 'T-SIM7070G',
      firmware_version: '',
      imei: '',
      mac_address: '',
      sim_number: '',
      sim_carrier: '',
      relay_count: 4,
      relay_labels: ['Relay 1', 'Relay 2', 'Relay 3', 'Relay 4'],
      input_count: 7,
      input_labels: ['Input 1', 'Input 2', 'Input 3', 'Input 4', 'Input 5', 'Input 6', 'Input 7'],
      notes: '',
      status: 'active',
    },
    validate: {
      device_id: (value) => (!value ? 'El ID del dispositivo es requerido' : null),
      name: (value) => (!value ? 'El nombre es requerido' : null),
    },
  });

  const loadDevices = async () => {
    try {
      const response = await fetch(apiUrl('/api/devices'));
      if (response.ok) {
        const data = await response.json();
        setDevices(data);
      }
    } catch (error) {
      console.error('Error loading devices:', error);
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
    loadDevices();
    loadCompanies();
  }, []);

  const handleCreate = () => {
    setSelectedDevice(null);
    form.reset();
    form.setFieldValue('model', 'T-SIM7070G');
    form.setFieldValue('status', 'active');
    form.setFieldValue('relay_count', 4);
    form.setFieldValue('input_count', 7);
    form.setFieldValue('relay_labels', ['Relay 1', 'Relay 2', 'Relay 3', 'Relay 4']);
    form.setFieldValue('input_labels', ['Input 1', 'Input 2', 'Input 3', 'Input 4', 'Input 5', 'Input 6', 'Input 7']);
    openModal();
  };

  // Helper to parse labels that might come as JSON string or array
  const parseLabels = (labels: string[] | string | null | undefined, defaultLabels: string[]): string[] => {
    if (!labels) return defaultLabels;

    // If it's a string, try to parse as JSON
    if (typeof labels === 'string') {
      try {
        const parsed = JSON.parse(labels);
        if (Array.isArray(parsed)) {
          return parsed.length > 0 ? parsed : defaultLabels;
        }
      } catch {
        // Not valid JSON, return defaults
        return defaultLabels;
      }
    }

    // If it's already an array
    if (Array.isArray(labels) && labels.length > 0) {
      return labels;
    }

    return defaultLabels;
  };

  const handleEdit = (device: Device) => {
    setSelectedDevice(device);
    const relayCount = device.relay_count || 4;
    const inputCount = device.input_count || 7;

    // Generate default labels
    const defaultRelayLabels = Array.from({ length: relayCount }, (_, i) => `Relay ${i + 1}`);
    const defaultInputLabels = Array.from({ length: inputCount }, (_, i) => `Input ${i + 1}`);

    // Parse labels from device (handles JSON string or array)
    const parsedRelayLabels = parseLabels(device.relay_labels, defaultRelayLabels);
    const parsedInputLabels = parseLabels(device.input_labels, defaultInputLabels);

    // Ensure arrays have correct length, filling with defaults if needed
    const relayLabels = [...parsedRelayLabels, ...defaultRelayLabels].slice(0, relayCount);
    const inputLabels = [...parsedInputLabels, ...defaultInputLabels].slice(0, inputCount);

    form.setValues({
      device_id: device.device_id,
      company_id: device.company_id?.toString() || '',
      name: device.name || '',
      location: device.location || '',
      model: device.model || 'T-SIM7070G',
      firmware_version: device.firmware_version || '',
      imei: device.imei || '',
      mac_address: device.mac_address || '',
      sim_number: device.sim_number || '',
      sim_carrier: device.sim_carrier || '',
      relay_count: relayCount,
      relay_labels: relayLabels,
      input_count: inputCount,
      input_labels: inputLabels,
      notes: device.notes || '',
      status: device.status,
    });
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    setSaving(true);
    try {
      const url = selectedDevice
        ? apiUrl(`/api/devices/${selectedDevice.id}`)
        : apiUrl('/api/devices');
      const method = selectedDevice ? 'PUT' : 'POST';

      const payload = {
        ...values,
        company_id: values.company_id ? parseInt(values.company_id) : null,
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
          message: data.error || 'Error al guardar dispositivo',
          color: 'red',
        });
        return;
      }

      notifications.show({
        title: 'Éxito',
        message: selectedDevice ? 'Dispositivo actualizado' : 'Dispositivo creado',
        color: 'green',
      });

      closeModal();
      loadDevices();
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
    if (!selectedDevice) return;

    try {
      const response = await fetch(apiUrl(`/api/devices/${selectedDevice.id}`), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        notifications.show({
          title: 'Error',
          message: data.error || 'Error al eliminar dispositivo',
          color: 'red',
        });
        return;
      }

      notifications.show({
        title: 'Éxito',
        message: 'Dispositivo eliminado',
        color: 'green',
      });

      closeDelete();
      loadDevices();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Error de conexión',
        color: 'red',
      });
    }
  };

  const getStatusBadge = (status: string, online: boolean) => {
    if (online) {
      return (
        <Badge color="green" variant="light" leftSection={<IconWifi size={12} />}>
          En línea
        </Badge>
      );
    }
    switch (status) {
      case 'active':
        return (
          <Badge color="cyan" variant="light" leftSection={<IconWifiOff size={12} />}>
            Activo (Offline)
          </Badge>
        );
      case 'inactive':
        return <Badge color="gray" variant="light">Inactivo</Badge>;
      case 'maintenance':
        return <Badge color="orange" variant="light">Mantenimiento</Badge>;
      default:
        return <Badge color="gray" variant="light">{status}</Badge>;
    }
  };

  const formatLastSeen = (lastSeen: string | null): string => {
    if (!lastSeen) return 'Nunca';
    const date = new Date(lastSeen);
    return date.toLocaleString('es-AR');
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Dispositivos</Title>
          <Text c="dimmed">Gestión de dispositivos IoT SmartFlex</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={handleCreate}>
          Nuevo Dispositivo
        </Button>
      </Group>

      {/* Search/Filter */}
      <Group>
        <TextInput
          placeholder="Buscar por nombre, ID, IMEI, ubicación o empresa..."
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
            {filteredDevices.length} de {devices.length} dispositivos
          </Text>
        )}
      </Group>

      <Card pos="relative">
        <LoadingOverlay visible={loading} />
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Dispositivo</Table.Th>
              <Table.Th>Empresa</Table.Th>
              <Table.Th>Ubicación</Table.Th>
              <Table.Th>IMEI</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Última Conexión</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredDevices.map((device) => (
              <Table.Tr key={device.id}>
                <Table.Td>
                  <Group gap="xs">
                    <Indicator
                      color={device.online ? 'green' : 'gray'}
                      size={10}
                      processing={device.online}
                    >
                      <IconDevices size={20} color="var(--mantine-color-cyan-6)" />
                    </Indicator>
                    <div>
                      <Text fw={500}>{device.name || 'Sin nombre'}</Text>
                      <Text size="xs" c="dimmed" ff="monospace">{device.device_id}</Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  {device.company_name ? (
                    <Group gap={4}>
                      <IconBuilding size={14} />
                      <Text size="sm">{device.company_name}</Text>
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed">Sin empresa</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  {device.location ? (
                    <Group gap={4}>
                      <IconMapPin size={14} color="var(--mantine-color-red-6)" />
                      <Text size="sm" lineClamp={1} maw={200}>{device.location}</Text>
                    </Group>
                  ) : (
                    <Text size="sm" c="dimmed">-</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm" ff="monospace">{device.imei || '-'}</Text>
                </Table.Td>
                <Table.Td>{getStatusBadge(device.status, device.online)}</Table.Td>
                <Table.Td>
                  <Text size="sm" c={device.online ? 'green' : 'dimmed'}>
                    {formatLastSeen(device.last_seen)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Tooltip label="Control WebUI">
                      <ActionIcon
                        variant="subtle"
                        color="green"
                        onClick={() => {
                          setSelectedDevice(device);
                          openControl();
                        }}
                      >
                        <IconPlayerPlay size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Editar">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEdit(device)}
                      >
                        <IconEdit size={18} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => {
                          setSelectedDevice(device);
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
            {filteredDevices.length === 0 && !loading && (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text ta="center" c="dimmed" py="xl">
                    {searchQuery
                      ? `No se encontraron dispositivos para "${searchQuery}"`
                      : 'No hay dispositivos registrados'}
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
        title={selectedDevice ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}
        size="xl"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Tabs defaultValue="general">
            <Tabs.List mb="md">
              <Tabs.Tab value="general" leftSection={<IconInfoCircle size={14} />}>
                General
              </Tabs.Tab>
              <Tabs.Tab value="hardware" leftSection={<IconCpu size={14} />}>
                Hardware
              </Tabs.Tab>
              <Tabs.Tab value="connectivity" leftSection={<IconAntenna size={14} />}>
                Conectividad
              </Tabs.Tab>
              <Tabs.Tab value="io" leftSection={<IconSettings size={14} />}>
                I/O Config
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="general">
              <Stack gap="md">
                <TextInput
                  label="ID del Dispositivo"
                  placeholder="SMART-867280068425057-10061C407AE8"
                  description="Identificador único del dispositivo (SMART-IMEI-MAC)"
                  {...form.getInputProps('device_id')}
                  disabled={!!selectedDevice}
                  required
                />

                <Select
                  label="Empresa"
                  placeholder="Seleccionar empresa"
                  leftSection={<IconBuilding size={16} />}
                  data={companies.map((c) => ({ value: c.id.toString(), label: c.name }))}
                  {...form.getInputProps('company_id')}
                  clearable
                />

                <TextInput
                  label="Nombre"
                  placeholder="Oficina Central"
                  description="Nombre descriptivo del dispositivo"
                  {...form.getInputProps('name')}
                  required
                />

                <TextInput
                  label="Ubicación"
                  placeholder="Av. Italia 4331, Buenos Aires"
                  leftSection={<IconMapPin size={16} />}
                  {...form.getInputProps('location')}
                />

                <Select
                  label="Estado"
                  data={[
                    { value: 'active', label: 'Activo' },
                    { value: 'inactive', label: 'Inactivo' },
                    { value: 'maintenance', label: 'En Mantenimiento' },
                  ]}
                  {...form.getInputProps('status')}
                />

                <Textarea
                  label="Notas"
                  placeholder="Observaciones adicionales..."
                  minRows={2}
                  {...form.getInputProps('notes')}
                />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="hardware">
              <Stack gap="md">
                <Grid>
                  <Grid.Col span={6}>
                    <Select
                      label="Modelo"
                      data={[
                        { value: 'T-SIM7070G', label: 'LilyGO T-SIM7070G' },
                        { value: 'T-SIM7000G', label: 'LilyGO T-SIM7000G' },
                        { value: 'ESP32-WROOM', label: 'ESP32-WROOM' },
                        { value: 'Custom', label: 'Personalizado' },
                      ]}
                      {...form.getInputProps('model')}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Versión Firmware"
                      placeholder="v52.3"
                      {...form.getInputProps('firmware_version')}
                    />
                  </Grid.Col>
                </Grid>

                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label="IMEI"
                      placeholder="867280068425057"
                      description="IMEI del modem celular"
                      {...form.getInputProps('imei')}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Dirección MAC"
                      placeholder="10:06:1C:40:7A:E8"
                      description="MAC del ESP32"
                      {...form.getInputProps('mac_address')}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="connectivity">
              <Stack gap="md">
                <Grid>
                  <Grid.Col span={6}>
                    <TextInput
                      label="Número de SIM"
                      placeholder="+54 9 11 1234-5678"
                      {...form.getInputProps('sim_number')}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      label="Operador"
                      placeholder="Seleccionar operador"
                      data={[
                        { value: 'Claro', label: 'Claro' },
                        { value: 'Movistar', label: 'Movistar' },
                        { value: 'Personal', label: 'Personal' },
                        { value: 'Tuenti', label: 'Tuenti' },
                        { value: 'Otro', label: 'Otro' },
                      ]}
                      {...form.getInputProps('sim_carrier')}
                      clearable
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="io">
              <Stack gap="md">
                <Grid>
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Cantidad de Relays"
                      min={1}
                      max={8}
                      {...form.getInputProps('relay_count')}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <NumberInput
                      label="Cantidad de Entradas"
                      min={1}
                      max={16}
                      {...form.getInputProps('input_count')}
                    />
                  </Grid.Col>
                </Grid>

                <Text size="sm" fw={500}>Etiquetas de Relays</Text>
                <Grid>
                  {Array.from({ length: form.values.relay_count }).map((_, i) => (
                    <Grid.Col span={6} key={`relay-${i}`}>
                      <TextInput
                        placeholder={`Relay ${i + 1}`}
                        value={(form.values.relay_labels && form.values.relay_labels[i]) || ''}
                        onChange={(e) => {
                          const currentLabels = form.values.relay_labels || [];
                          const newLabels = [...currentLabels];
                          // Ensure array is long enough
                          while (newLabels.length <= i) {
                            newLabels.push(`Relay ${newLabels.length + 1}`);
                          }
                          newLabels[i] = e.currentTarget.value;
                          form.setFieldValue('relay_labels', newLabels);
                        }}
                      />
                    </Grid.Col>
                  ))}
                </Grid>

                <Text size="sm" fw={500}>Etiquetas de Entradas</Text>
                <Grid>
                  {Array.from({ length: Math.min(form.values.input_count, 7) }).map((_, i) => (
                    <Grid.Col span={6} key={`input-${i}`}>
                      <TextInput
                        placeholder={`Input ${i + 1}`}
                        value={(form.values.input_labels && form.values.input_labels[i]) || ''}
                        onChange={(e) => {
                          const currentLabels = form.values.input_labels || [];
                          const newLabels = [...currentLabels];
                          // Ensure array is long enough
                          while (newLabels.length <= i) {
                            newLabels.push(`Input ${newLabels.length + 1}`);
                          }
                          newLabels[i] = e.currentTarget.value;
                          form.setFieldValue('input_labels', newLabels);
                        }}
                      />
                    </Grid.Col>
                  ))}
                </Grid>
              </Stack>
            </Tabs.Panel>
          </Tabs>

          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {selectedDevice ? 'Guardar' : 'Crear'}
            </Button>
          </Group>
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
            ¿Estás seguro de eliminar el dispositivo{' '}
            <strong>{selectedDevice?.name || selectedDevice?.device_id}</strong>?
          </Text>
          <Text size="sm" c="dimmed">
            Esta acción eliminará también los permisos y configuraciones asociadas.
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

      {/* Control WebUI Modal */}
      <Modal
        opened={controlOpened}
        onClose={closeControl}
        title={
          <Group gap="sm">
            <IconPlayerPlay size={20} color="var(--mantine-color-green-6)" />
            <Text fw={500}>Control WebUI - {selectedDevice?.name || selectedDevice?.device_id}</Text>
          </Group>
        }
        size="100%"
        fullScreen
        styles={{
          body: { padding: 0, height: 'calc(100vh - 60px)' },
          header: { borderBottom: '1px solid var(--mantine-color-default-border)' },
        }}
      >
        {selectedDevice && (
          <iframe
            src={`https://smartflex.com.ar/webui.html?device_id=${encodeURIComponent(selectedDevice.device_id)}&name=${encodeURIComponent(selectedDevice.name || selectedDevice.device_id)}&autoconnect=1`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title={`WebUI Control - ${selectedDevice.device_id}`}
          />
        )}
      </Modal>
    </Stack>
  );
}

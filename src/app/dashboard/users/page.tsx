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
  Alert,
  LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconKey,
  IconLock,
  IconAlertCircle,
} from '@tabler/icons-react';
import { apiUrl } from '@/lib/client-api';

interface User {
  id: number;
  username: string;
  email: string | null;
  full_name: string | null;
  role: string;
  is_active: boolean;
  must_change_password: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
  last_login: string | null;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      full_name: '',
      role: 'viewer',
      is_active: true,
    },
  });

  const loadUsers = async () => {
    try {
      const response = await fetch(apiUrl('/api/users'));
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = () => {
    setSelectedUser(null);
    form.reset();
    openModal();
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    form.setValues({
      username: user.username,
      email: user.email || '',
      full_name: user.full_name || '',
      role: user.role,
      is_active: user.is_active,
    });
    openModal();
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users';
      const method = selectedUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        notifications.show({
          title: 'Error',
          message: data.error || 'Error al guardar usuario',
          color: 'red',
        });
        return;
      }

      notifications.show({
        title: 'Éxito',
        message: selectedUser ? 'Usuario actualizado' : 'Usuario creado con clave por defecto',
        color: 'green',
      });

      closeModal();
      loadUsers();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Error de conexión',
        color: 'red',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        notifications.show({
          title: 'Error',
          message: data.error || 'Error al eliminar usuario',
          color: 'red',
        });
        return;
      }

      notifications.show({
        title: 'Éxito',
        message: 'Usuario eliminado',
        color: 'green',
      });

      closeDelete();
      loadUsers();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Error de conexión',
        color: 'red',
      });
    }
  };

  const handleResetPassword = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}/reset-password`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        notifications.show({
          title: 'Error',
          message: data.error || 'Error al resetear contraseña',
          color: 'red',
        });
        return;
      }

      notifications.show({
        title: 'Éxito',
        message: `Contraseña de ${user.username} reseteada a la clave por defecto`,
        color: 'green',
      });

      loadUsers();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Error de conexión',
        color: 'red',
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'grape';
      case 'admin': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>Usuarios</Title>
          <Text c="dimmed">Gestión de usuarios administrativos</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={handleCreate}>
          Nuevo Usuario
        </Button>
      </Group>

      <Card pos="relative">
        <LoadingOverlay visible={loading} />
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Usuario</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Rol</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Último Login</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>
                  <Text fw={500}>{user.username}</Text>
                  {user.full_name && (
                    <Text size="xs" c="dimmed">{user.full_name}</Text>
                  )}
                </Table.Td>
                <Table.Td>{user.email || '-'}</Table.Td>
                <Table.Td>
                  <Badge color={getRoleBadgeColor(user.role)} variant="light">
                    {user.role}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Badge color={user.is_active ? 'green' : 'red'} variant="dot">
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                    {user.locked_until && (
                      <Badge color="orange" variant="light" leftSection={<IconLock size={12} />}>
                        Bloqueado
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  {user.last_login
                    ? new Date(user.last_login).toLocaleString('es-AR')
                    : 'Nunca'}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => handleEdit(user)}
                      title="Editar"
                    >
                      <IconEdit size={18} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="orange"
                      onClick={() => handleResetPassword(user)}
                      title="Resetear Contraseña"
                    >
                      <IconKey size={18} />
                    </ActionIcon>
                    {user.role !== 'superadmin' && (
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => {
                          setSelectedUser(user);
                          openDelete();
                        }}
                        title="Eliminar"
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {!selectedUser && (
              <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
                El usuario será creado con la clave por defecto.
                Deberá cambiarla en su primer acceso.
              </Alert>
            )}

            <TextInput
              label="Usuario"
              placeholder="username"
              {...form.getInputProps('username')}
              disabled={!!selectedUser}
              required
            />

            <TextInput
              label="Email"
              placeholder="email@example.com"
              {...form.getInputProps('email')}
            />

            <TextInput
              label="Nombre Completo"
              placeholder="Juan Pérez"
              {...form.getInputProps('full_name')}
            />

            <Select
              label="Rol"
              data={[
                { value: 'viewer', label: 'Viewer (Solo lectura)' },
                { value: 'admin', label: 'Admin (Gestión)' },
                { value: 'superadmin', label: 'Superadmin (Total)' },
              ]}
              {...form.getInputProps('role')}
              required
            />

            {selectedUser && (
              <Switch
                label="Usuario activo"
                {...form.getInputProps('is_active', { type: 'checkbox' })}
              />
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit">
                {selectedUser ? 'Guardar' : 'Crear'}
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
            ¿Estás seguro de eliminar al usuario <strong>{selectedUser?.username}</strong>?
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

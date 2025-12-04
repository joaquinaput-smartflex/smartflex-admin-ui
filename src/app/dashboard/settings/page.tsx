'use client';

import { useEffect, useState } from 'react';
import {
  Title,
  Text,
  Stack,
  Card,
  TextInput,
  Button,
  Group,
  Alert,
  LoadingOverlay,
  PasswordInput,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconKey, IconAlertCircle, IconRefresh, IconCheck } from '@tabler/icons-react';
import { apiUrl } from '@/lib/client-api';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (value) =>
        value.length < 6 ? 'La contraseña debe tener al menos 6 caracteres' : null,
      confirmPassword: (value, values) =>
        value !== values.password ? 'Las contraseñas no coinciden' : null,
    },
  });

  const loadCurrentPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiUrl('/api/settings/default-password'));
      if (response.ok) {
        const data = await response.json();
        setCurrentPassword(data.password || 'iot@Smartflex');
      } else if (response.status === 403) {
        // Not superadmin - redirect
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Error loading password:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentPassword();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    setSaving(true);
    try {
      const response = await fetch(apiUrl('/api/settings/default-password'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: values.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        notifications.show({
          title: 'Error',
          message: data.error || 'Error al guardar',
          color: 'red',
        });
        return;
      }

      notifications.show({
        title: 'Éxito',
        message: 'Clave por defecto actualizada correctamente',
        color: 'green',
        icon: <IconCheck size={18} />,
      });

      form.reset();
      setCurrentPassword(values.password);
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

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Configuración</Title>
        <Text c="dimmed">Configuración del sistema (Solo Superadmin)</Text>
      </div>

      <Card pos="relative" maw={500}>
        <LoadingOverlay visible={loading} />

        <Stack gap="md">
          <Group gap="xs">
            <IconKey size={24} />
            <Title order={4}>Clave por Defecto para Nuevos Usuarios</Title>
          </Group>

          <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
            Esta contraseña se asigna automáticamente cuando:
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              <li>Se crea un nuevo usuario</li>
              <li>Se resetea la contraseña de un usuario existente</li>
            </ul>
            Los usuarios deben cambiarla en su primer acceso.
          </Alert>

          <Divider />

          <TextInput
            label="Clave Actual"
            value={currentPassword}
            readOnly
            rightSection={
              <Button
                variant="subtle"
                size="xs"
                onClick={loadCurrentPassword}
                loading={loading}
              >
                <IconRefresh size={14} />
              </Button>
            }
            styles={{
              input: {
                backgroundColor: 'var(--mantine-color-dark-6)',
                fontFamily: 'monospace',
              },
            }}
          />

          <Divider label="Cambiar Clave por Defecto" labelPosition="center" />

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <PasswordInput
                label="Nueva Clave por Defecto"
                placeholder="Ingrese nueva clave..."
                {...form.getInputProps('password')}
              />

              <PasswordInput
                label="Confirmar Nueva Clave"
                placeholder="Repita la nueva clave..."
                {...form.getInputProps('confirmPassword')}
              />

              <Group justify="flex-end" mt="md">
                <Button
                  variant="subtle"
                  onClick={() => form.reset()}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  loading={saving}
                  leftSection={<IconKey size={18} />}
                >
                  Guardar Nueva Clave
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Stack>
  );
}

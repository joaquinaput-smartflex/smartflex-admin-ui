'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Alert,
  Center,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle, IconLogin } from '@tabler/icons-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (value.length < 1 ? 'Usuario requerido' : null),
      password: (value) => (value.length < 1 ? 'Contraseña requerida' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
      }}
    >
      <Container size={420} my={40}>
        <Center mb="xl">
          <Stack align="center" gap="xs">
            <Title
              style={{
                fontSize: 28,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SMARTFLEX
            </Title>
            <Text c="dimmed" size="sm">
              Panel de Administración
            </Text>
          </Stack>
        </Center>

        <Paper withBorder shadow="md" p={30} radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {error && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Error"
                  color="red"
                  variant="light"
                >
                  {error}
                </Alert>
              )}

              <TextInput
                label="Usuario"
                placeholder="admin"
                {...form.getInputProps('username')}
                autoComplete="username"
              />

              <PasswordInput
                label="Contraseña"
                placeholder="••••••••"
                {...form.getInputProps('password')}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                leftSection={<IconLogin size={18} />}
                mt="sm"
              >
                Iniciar Sesión
              </Button>
            </Stack>
          </form>
        </Paper>

        <Text c="dimmed" size="xs" ta="center" mt="md">
          SmartFlex IoT Control System v1.0
        </Text>
      </Container>
    </Box>
  );
}

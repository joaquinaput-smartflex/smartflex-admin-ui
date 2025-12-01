import { Title, Text, SimpleGrid, Card, Group, ThemeIcon, Stack } from '@mantine/core';
import { IconUsers, IconDevices, IconActivity } from '@tabler/icons-react';
import { getSession } from '@/lib/session';
import { healthApi } from '@/lib/api';

export default async function DashboardPage() {
  const session = await getSession();
  const healthResult = await healthApi.check();
  const health = healthResult.data;

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Dashboard</Title>
        <Text c="dimmed">Bienvenido, {session?.username}</Text>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        <Card>
          <Group>
            <ThemeIcon size="xl" radius="md" variant="light" color="blue">
              <IconActivity size={24} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Estado del Sistema
              </Text>
              <Text size="xl" fw={700} c={health?.status === 'ok' ? 'green' : 'red'}>
                {health?.status === 'ok' ? 'Operativo' : 'Error'}
              </Text>
            </div>
          </Group>
        </Card>

        <Card>
          <Group>
            <ThemeIcon size="xl" radius="md" variant="light" color="teal">
              <IconDevices size={24} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Dispositivos Activos
              </Text>
              <Text size="xl" fw={700}>
                {health?.devices_cached ?? 0}
              </Text>
            </div>
          </Group>
        </Card>

        <Card>
          <Group>
            <ThemeIcon size="xl" radius="md" variant="light" color="grape">
              <IconUsers size={24} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                MQTT
              </Text>
              <Text size="xl" fw={700} c={health?.mqtt_connected ? 'green' : 'red'}>
                {health?.mqtt_connected ? 'Conectado' : 'Desconectado'}
              </Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}

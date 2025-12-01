import { Title, Text, Stack, Card, Alert } from '@mantine/core';
import { IconDevices, IconAlertCircle } from '@tabler/icons-react';

export default function DevicesPage() {
  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>Dispositivos</Title>
        <Text c="dimmed">Gestión de dispositivos IoT</Text>
      </div>

      <Card>
        <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
          <Text>
            La gestión de dispositivos está en desarrollo.
            Por ahora, usa la API directamente o el panel legacy.
          </Text>
        </Alert>
      </Card>
    </Stack>
  );
}

'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Title,
  Text,
  Avatar,
  Menu,
  UnstyledButton,
  Badge,
  Divider,
  Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconDashboard,
  IconUsers,
  IconDevices,
  IconSettings,
  IconLogout,
  IconChevronDown,
  IconKey,
  IconBuilding,
} from '@tabler/icons-react';
import { apiUrl } from '@/lib/client-api';

interface DashboardShellProps {
  children: React.ReactNode;
  username: string;
  role: string;
}

const navigation = [
  { label: 'Dashboard', icon: IconDashboard, href: '/dashboard' },
  { label: 'Empresas', icon: IconBuilding, href: '/dashboard/companies', roles: ['admin', 'superadmin'] },
  { label: 'Usuarios', icon: IconUsers, href: '/dashboard/users', roles: ['admin', 'superadmin'] },
  { label: 'Dispositivos', icon: IconDevices, href: '/dashboard/devices' },
];

export function DashboardShell({ children, username, role }: DashboardShellProps) {
  const [opened, { toggle }] = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch(apiUrl('/api/auth/logout'), { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const getRoleBadgeColor = (r: string) => {
    switch (r) {
      case 'superadmin': return 'grape';
      case 'admin': return 'blue';
      default: return 'gray';
    }
  };

  const filteredNav = navigation.filter(
    item => !item.roles || item.roles.includes(role)
  );

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title
              order={3}
              style={{
                fontSize: 20,
                background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SMARTFLEX
            </Title>
          </Group>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Avatar color="smartflex" radius="xl" size="sm">
                    {username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box visibleFrom="sm">
                    <Text size="sm" fw={500}>{username}</Text>
                    <Badge size="xs" color={getRoleBadgeColor(role)} variant="light">
                      {role}
                    </Badge>
                  </Box>
                  <IconChevronDown size={14} />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Cuenta</Menu.Label>
              {role === 'superadmin' && (
                <Menu.Item
                  leftSection={<IconKey size={14} />}
                  onClick={() => router.push('/dashboard/settings')}
                >
                  Configuración
                </Menu.Item>
              )}
              <Divider my="xs" />
              <Menu.Item
                color="red"
                leftSection={<IconLogout size={14} />}
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          {filteredNav.map((item) => (
            <NavLink
              key={item.href}
              label={item.label}
              leftSection={<item.icon size={18} />}
              active={pathname === item.href}
              onClick={() => {
                router.push(item.href);
                toggle();
              }}
              variant="filled"
              mb={4}
            />
          ))}
        </AppShell.Section>

        {role === 'superadmin' && (
          <AppShell.Section>
            <Divider my="sm" />
            <NavLink
              label="Configuración"
              leftSection={<IconSettings size={18} />}
              active={pathname === '/dashboard/settings'}
              onClick={() => {
                router.push('/dashboard/settings');
                toggle();
              }}
              variant="filled"
            />
          </AppShell.Section>
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}

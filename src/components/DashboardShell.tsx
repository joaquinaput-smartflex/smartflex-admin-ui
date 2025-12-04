'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Text,
  Avatar,
  Menu,
  UnstyledButton,
  Badge,
  Divider,
  Box,
  Stack,
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
  IconBolt,
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
      case 'admin': return 'cyan';
      default: return 'gray';
    }
  };

  const filteredNav = navigation.filter(
    item => !item.roles || item.roles.includes(role)
  );

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      styles={{
        main: {
          backgroundColor: '#0a0f1a',
        },
        header: {
          backgroundColor: '#0a0f1a',
          borderBottom: '1px solid #06b6d4',
          boxShadow: '0 4px 30px rgba(6, 182, 212, 0.2)',
        },
        navbar: {
          backgroundColor: '#111827',
          borderRight: '1px solid #1e293b',
        },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="md">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="#e2e8f0" />

            {/* Logo with icon and gradient text */}
            <Group gap="xs">
              <Box
                style={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                }}
              >
                <IconBolt size={24} color="white" />
              </Box>
              <Stack gap={0}>
                <Text
                  fw={700}
                  style={{
                    fontSize: 22,
                    background: 'linear-gradient(135deg, #fff, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.5px',
                  }}
                >
                  SMARTFLEX<span style={{ fontStyle: 'italic', color: '#06b6d4', WebkitTextFillColor: '#06b6d4' }}> IoT</span>
                </Text>
                <Text
                  size="xs"
                  c="#06b6d4"
                  style={{ letterSpacing: '2px', textTransform: 'uppercase', marginTop: -2 }}
                >
                  Admin Panel
                </Text>
              </Stack>
            </Group>
          </Group>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <UnstyledButton
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  transition: 'background-color 0.2s',
                }}
                className="sf-card"
              >
                <Group gap="xs">
                  <Avatar
                    radius="xl"
                    size="sm"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #a855f7)',
                    }}
                  >
                    {username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box visibleFrom="sm">
                    <Text size="sm" fw={500} c="#e2e8f0">{username}</Text>
                    <Badge size="xs" color={getRoleBadgeColor(role)} variant="light">
                      {role}
                    </Badge>
                  </Box>
                  <IconChevronDown size={14} color="#64748b" />
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown
              style={{
                backgroundColor: '#111827',
                borderColor: '#1e293b',
              }}
            >
              <Menu.Label>Cuenta</Menu.Label>
              {role === 'superadmin' && (
                <Menu.Item
                  leftSection={<IconKey size={14} />}
                  onClick={() => router.push('/dashboard/settings')}
                >
                  Configuración
                </Menu.Item>
              )}
              <Divider my="xs" color="#1e293b" />
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
              mb={4}
              styles={{
                root: {
                  borderRadius: 8,
                  color: '#e2e8f0',
                  '&:hover': {
                    backgroundColor: '#1a2332',
                  },
                  '&[data-active]': {
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    borderLeft: '3px solid #3b82f6',
                    color: '#3b82f6',
                  },
                },
              }}
            />
          ))}
        </AppShell.Section>

        {role === 'superadmin' && (
          <AppShell.Section>
            <Divider my="sm" color="#1e293b" />
            <NavLink
              label="Configuración"
              leftSection={<IconSettings size={18} />}
              active={pathname === '/dashboard/settings'}
              onClick={() => {
                router.push('/dashboard/settings');
                toggle();
              }}
              styles={{
                root: {
                  borderRadius: 8,
                  color: '#e2e8f0',
                  '&:hover': {
                    backgroundColor: '#1a2332',
                  },
                  '&[data-active]': {
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    borderLeft: '3px solid #3b82f6',
                    color: '#3b82f6',
                  },
                },
              }}
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

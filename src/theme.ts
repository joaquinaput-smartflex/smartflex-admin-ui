import { createTheme, MantineColorsTuple } from '@mantine/core';

// SmartFlex brand colors - matching existing admin panel
const smartflex: MantineColorsTuple = [
  '#e5f4ff',
  '#cde4ff',
  '#9bc6fc',
  '#64a6f9',
  '#3b82f6',  // Matches gradient
  '#1a56db',  // Primary from old panel
  '#1e40af',  // Primary dark
  '#1e3a8a',
  '#1e3a8a',
  '#172554'
];

const success: MantineColorsTuple = [
  '#ecfdf5',
  '#d1fae5',
  '#a7f3d0',
  '#6ee7b7',
  '#34d399',  // Light success
  '#10b981',
  '#059669',  // Main success from old panel
  '#047857',
  '#065f46',
  '#064e3b'
];

export const theme = createTheme({
  primaryColor: 'smartflex',
  colors: {
    smartflex,
    success,
  },
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '600',
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Button: {
      defaultProps: {
        size: 'sm',
      },
    },
    TextInput: {
      defaultProps: {
        size: 'sm',
      },
    },
    PasswordInput: {
      defaultProps: {
        size: 'sm',
      },
    },
    Select: {
      defaultProps: {
        size: 'sm',
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
        withBorder: true,
      },
    },
  },
});

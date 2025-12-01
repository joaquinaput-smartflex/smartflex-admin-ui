import { createTheme, MantineColorsTuple } from '@mantine/core';

// SmartFlex brand colors
const smartflex: MantineColorsTuple = [
  '#e5f4ff',
  '#cde4ff',
  '#9bc6fc',
  '#64a6f9',
  '#398bf6',
  '#1d7af5',
  '#0971f6',
  '#0060db',
  '#0055c4',
  '#0049ac'
];

const success: MantineColorsTuple = [
  '#e6fcf5',
  '#c3fae8',
  '#96f2d7',
  '#63e6be',
  '#38d9a9',
  '#20c997',
  '#12b886',
  '#0ca678',
  '#099268',
  '#087f5b'
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

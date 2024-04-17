export default () => ({
  defaultValues: {
    booleanDefaultValue: false,
  },
  isLocked: {
    lockedValue: true,
    unlockedValue: false,
  },
  roles: {
    admin: 'Admin',
    employee: 'Employee',
  },
  passwordLength: 12,
  emptyArray: 0,
  isActivated: true,
  isDeactivated: false,
});

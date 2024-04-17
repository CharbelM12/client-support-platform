export default () => ({
  otp: {
    length: 4,
    charset: 'numeric',
    type: 'forgotPassword',
  },
  verificationToken: {
    format: 'hex',
  },
  retryCount: {
    incrementValue: 1,
    defaultValue: 0,
    maxValue: 5,
  },
});

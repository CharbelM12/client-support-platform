export default () => ({
  database: {
    connectionString: process.env.DB_CONNECTION_STRING,
  },
  port: process.env.PORT,
  validationPipe: {
    booleanValue: true,
  },
  tokens: {
    accessTokenExpiry: '15m',
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  },
  timestamps: {
    timestampsValue: true,
  },
  collections: {
    userCollection: 'User',
    categoryCollection: 'Category',
    complaintCollection: 'Complaint',
    userOtpCollection: 'Userotp',
    roomCollection: 'Room',
  },
  mailOptions: {
    service: 'gmail',
    from: 'mounayercharbel07@gmail.com',
    user: process.env.USER,
    pass: process.env.PASS,
  },
  momentAddParams: {
    duration: 15,
    unit: 'm',
  },
  socketIo: {
    corsOrigin: ['http://localhost:3000'],
    corsMethods: ['GET', 'POST'],
  },
  pagination: {
    defaultValues: {
      page: 1,
      limit: 20,
    },
    minValue: 1,
  },
  isLocked: {
    lockedValue: true,
    unLockedValue: false,
  },
  roleFlags: {
    isEmployee: true,
    isAdmin: true,
    isEmployeeFalse: false,
    isAdminFalse: false,
  },
  upsertValue: true,
  isPublic: true,
});

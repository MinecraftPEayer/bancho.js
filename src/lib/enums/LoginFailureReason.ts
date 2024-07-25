enum LoginFailureReason {
    AuthenticationFailed = -1,
    OldClient = -2,
    Banned = -3,
    ErrorOccurred = -5,
    NeedSupporter = -6,
    PasswordReset = -7,
    RequireVerification = -8
}

export default LoginFailureReason;
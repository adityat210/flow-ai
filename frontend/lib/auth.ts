import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

function hasCognitoConfig() {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
  return Boolean(userPoolId && clientId);
}

function getUserPool() {
  const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
  const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;

  if (!userPoolId || !clientId) {
    throw new Error("Cognito configuration is missing.");
  }

  return new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: clientId,
  });
}

export function signUp(email: string, password: string) {
  if (!hasCognitoConfig()) {
    return Promise.resolve({
      userSub: `local-cognito-${email}`,
      message: "Local Cognito-style signup simulated.",
    });
  }

  const attributes = [
    new CognitoUserAttribute({
      Name: "email",
      Value: email,
    }),
  ];

  return new Promise((resolve, reject) => {
    getUserPool().signUp(email, password, attributes, [], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export function confirmSignUp(email: string, code: string) {
  if (!hasCognitoConfig()) {
    return Promise.resolve(
      `Local confirmation accepted for ${email} with code ${code || "demo"}.`
    );
  }

  const user = new CognitoUser({
    Username: email,
    Pool: getUserPool(),
  });

  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

export function signIn(email: string, password: string) {
  if (!hasCognitoConfig()) {
    const payload = {
      sub: `local-cognito-${email || "demo-user"}`,
      email: email || "demo@flowintel.local",
      auth_mode: "local-cognito-simulation",
      issued_at: new Date().toISOString(),
    };

    return Promise.resolve(`local.${btoa(JSON.stringify(payload))}.signature`);
  }

  const user = new CognitoUser({
    Username: email,
    Pool: getUserPool(),
  });

  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  return new Promise<string>((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve(session.getIdToken().getJwtToken());
      },
      onFailure: (err) => {
        reject(err);
      },
    });
  });
}

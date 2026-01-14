export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      familyMemberId?: number;
    };
  }
}

import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      accountType: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    accountType: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountType: string
  }
}

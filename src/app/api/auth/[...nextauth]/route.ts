import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        // Usuario unico configurado en variables de entorno
        const validUser = process.env.AUTH_USER || "admin"
        const validPassword = process.env.AUTH_PASSWORD || "neurodoc2024"

        if (
          credentials?.username === validUser &&
          credentials?.password === validPassword
        ) {
          return {
            id: "1",
            name: "Dr. Neurocirujano",
            email: "doctor@neurodoc.cl"
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "neurodoc-secret-key-change-in-production",
})

export { handler as GET, handler as POST }

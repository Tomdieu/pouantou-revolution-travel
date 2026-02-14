import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                role: true,
                image: true,
                phone: true,
            },
        });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await getUser(email);
                    if (!user) return null;
                    // For OAuth users who haven't set a password
                    if (!user.password) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                // Add role and phone to session
                if (token.role) {
                    session.user.role = token.role as "USER" | "ADMIN";
                }
                if (token.phone) {
                    session.user.phone = token.phone as string;
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            // Add role and phone to token on sign in
            if (user) {
                token.role = user.role;
                token.phone = user.phone;
            }
            return token;
        },
        async signIn({ user, account }) {
            // For OAuth providers, ensure user has a role
            if (account?.provider === "google" && user.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email },
                    select: { role: true },
                });

                // If user doesn't have a role, set default to USER
                if (dbUser && !dbUser.role) {
                    await prisma.user.update({
                        where: { email: user.email },
                        data: { role: "USER" },
                    });
                }
            }
            return true;
        },
    },
    pages: {
        signIn: '/login',
    },
})
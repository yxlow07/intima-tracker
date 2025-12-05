import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.ADMIN_PASSWORD || "default-secret-key";
const key = new TextEncoder().encode(secretKey);

export async function signSession(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(key);
}

export async function verifySession(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

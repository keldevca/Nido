import webpush from "web-push";
import { prisma } from "./prisma";

let configured = false;

function configure() {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@nido.local";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
  badge?: string;
};

type SubRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function sendPushToOthers(payload: PushPayload, exceptUser: string | null) {
  if (!configure()) return;

  const subs = await prisma.pushSubscription.findMany({
    where: exceptUser
      ? { OR: [{ userName: { not: exceptUser } }, { userName: null }] }
      : undefined,
  });

  const body = JSON.stringify(payload);

  await Promise.all(
    (subs as SubRow[]).map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body
        );
      } catch (err: any) {
        const status = err?.statusCode;
        if (status === 404 || status === 410) {
          await prisma.pushSubscription
            .delete({ where: { id: sub.id } })
            .catch(() => {});
        } else {
          console.error("[push]", status, err?.body || err?.message);
        }
      }
    })
  );
}

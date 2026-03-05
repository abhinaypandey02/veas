import { db } from "@/app/api/lib/db";
import { ChatRole, ChatTable } from "@/app/api/(graphql)/Chat/db";
import { and, eq, gte } from "drizzle-orm";
import { MAXIMUM_MESSAGES } from "@/mobile/constants/chat";
import { SubscriptionTable } from "@/app/api/(graphql)/Subscription/db";
import { SubscriptionType } from "@/app/api/(graphql)/Subscription/enum";

export async function getAvailableUsage(id: number) {
  const totalChats = await db
    .select()
    .from(ChatTable)
    .where(and(eq(ChatTable.role, ChatRole.User), eq(ChatTable.id, id)))
    .limit(MAXIMUM_MESSAGES.PRO_DAILY_LIMIT);

  const availableFreeTier = MAXIMUM_MESSAGES.FREE_TIER - totalChats.length;
  if (availableFreeTier > 0) return availableFreeTier;

  const lastDay = new Date();
  lastDay.setDate(lastDay.getDate() - 1);
  const chatsInLast24Hours = totalChats.filter(
    (chat) => chat.createdAt > lastDay,
  );

  const freeLimit =
    MAXIMUM_MESSAGES.FREE_DAILY_LIMIT - chatsInLast24Hours.length;

  if (freeLimit > 0) return freeLimit;

  const [sub] = await db
    .select({
      type: SubscriptionTable.type,
    })
    .from(SubscriptionTable)
    .where(
      and(
        eq(SubscriptionTable.userId, id),
        gte(SubscriptionTable.validTill, new Date()),
      ),
    );

  if (!sub) return 0;

  if (sub.type === SubscriptionType.Pro) {
    return MAXIMUM_MESSAGES.PRO_DAILY_LIMIT - chatsInLast24Hours.length;
  }

  return 0;
}

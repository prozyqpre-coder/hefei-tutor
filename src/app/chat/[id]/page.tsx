export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="px-4 py-6">
      <h1 className="text-lg font-semibold">站内信</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        第 5 步将实现极简聊天与防跳单、确认匹配弹窗
      </p>
      <p className="mt-1 text-xs text-muted-foreground">会话 ID: {id}</p>
    </div>
  );
}

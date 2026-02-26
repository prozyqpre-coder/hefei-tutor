'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function AdminPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const supabase = createClient();
      const { data } = await supabase
        .from('tutor_posts')
        .select('*')
        .eq('status', 'pending');
      if (data) setPosts(data);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  // 这里的 newStatus 类型必须严格匹配数据库：'verified' | 'rejected'
  async function handleApprove(id: string, newStatus: 'verified' | 'rejected') {
    const supabase = createClient();
    const { error } = await supabase
      .from('tutor_posts')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      alert('操作成功！已设置为: ' + (newStatus === 'verified' ? '通过' : '拒绝'));
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert('数据库报错: ' + error.message);
    }
  }

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <h1 className="text-lg font-semibold text-gray-900">管理员后台</h1>
      <p className="mt-2 text-sm text-gray-500">第 4 步：正在实现学生资料审核</p>

      <div className="mt-8 space-y-4">
        {loading ? (
          <p className="text-sm text-gray-400">正在拉取资料...</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">✅ 目前没有待审核资料。</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg shadow-sm bg-white">
              <div>
                <p className="font-medium text-sm">{post.title || '待审核信息'}</p>
                <p className="text-[10px] text-gray-400">ID: {post.id}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleApprove(post.id, 'verified')} // 这里改为传 'verified'
                  className="px-3 py-1.5 bg-black text-white text-xs rounded-md hover:bg-gray-800 transition"
                >
                  通过
                </button>
                <button 
                  onClick={() => handleApprove(post.id, 'rejected')}
                  className="px-3 py-1.5 border text-xs rounded-md hover:bg-gray-50 transition"
                >
                  拒绝
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
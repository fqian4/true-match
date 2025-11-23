'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MoreVertical } from 'lucide-react';

export default function HomePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

const [previewImage, setPreviewImage] = useState<string | null>(null);
const [showPreview, setShowPreview] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

const menuRef = useRef<HTMLDivElement>(null);

const logout = () => {
  localStorage.removeItem('currentUser');
  window.location.href = '/register';
};



  useEffect(() => {
    // 从 localStorage 读取登录用户
    const user = localStorage.getItem('currentUser');

console.log('localStorage user', user);

    if (!user) {
window.location.href = '/register';
  return;
    }
    const parsedUser = JSON.parse(user);

console.log('parsedUser', parsedUser);
    setCurrentUser(parsedUser);

    // 查询其他用户
    const fetchUsers = async () => {
      const { data: allUsers } = await supabase
        .from('users')
        .select('*')
        .neq('id', parsedUser.id); // 排除自己
      setUsers(allUsers ?? []);
    };
    fetchUsers();
  }, []);

useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setMenuOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

useEffect(() => {
  if (typeof window !== 'undefined' && document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}, []);

  const sendRequest = async (receiverId: string) => {
    if (!currentUser) return;
    const { error } = await supabase.from('requests').insert([
      {
        sender_id: currentUser.id,
        receiver_id: receiverId,
        status: 'pending',
      },
    ]);
    if (error) alert('申请失败');
    else alert('已发送申请');
  };

  const payRequest = async (receiverId: string) => {
    if (!currentUser) return;
    const { error } = await supabase.from('requests').insert([
      {
        sender_id: currentUser.id,
        receiver_id: receiverId,
        status: 'pending',
      },
    ]);
    if (error) alert('申请失败');
    else alert('已发送申请');

window.location.href = '/pay'
  };

const handleSetPassword = async () => {
  if (!currentUser) return;

  const pwd = prompt("请输入新密码（无格式限制）：");

  if (pwd === null) return; // 用户取消
  if (pwd.trim() === "") {
    alert("密码不能为空");
    return;
  }

  const { error } = await supabase
    .from('users')
    .update({ password: pwd })
    .eq('id', currentUser.id);

  if (error) {
    alert("设置失败，请稍后再试");
  } 
};

  return (

<div className="bg-white min-h-screen p-4">

    {/* 🔹 左上角的 Match 按钮 
    <div className="fixed top-3 left-3 z-50 ml-2">
      <button
        className="font-normal text-xl cursor-pointer "
        onClick={() => (window.location.href = '/matches')}
      >
        Match

      </button>
    </div>
*/}

<div className="fixed top-4 right-4 z-50" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 cursor-pointer"
tabIndex={-1}
        >
<div className="flex gap-[2px]">
  <span className="w-[3px] h-[3px] bg-black rounded-full"></span>
  <span className="w-[3px] h-[3px] bg-black rounded-full"></span>
  <span className="w-[3px] h-[3px] bg-black rounded-full"></span>
</div>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-lg w-32">
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => (window.location.href = '/matches')}
            >
              Matches
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => (window.location.href = '/requests')}
            >
              申请
            </button>
<button
  className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
  onClick={handleSetPassword}
>
  密码设置
</button>
<button
  className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer"
  onClick={logout}
>
  退出
</button>
          </div>
        )}
      </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
      {users.map((u) => (
        <Card key={u.id} className="p-4 flex flex-col items-center">
          <img
            src={u.avatar_url}
            className="w-24 h-24 rounded-full object-cover mb-3 border"
            alt="avatar"
  onClick={() => {
    setPreviewImage(u.avatar_url);
    setShowPreview(true);
  }}
          />
          <p className="font-medium mb-2">
            {u.wechat_id
              ? u.wechat_id.charAt(0) + '***'
              : '***'}
          </p>
{u.douyin && (
  <p className="text-sm text-gray-500 mb-2">
    抖音：{u.douyin}
  </p>
)}

<div className="flex gap-3 mt-2">
  <Button size="sm" onClick={() => sendRequest(u.id)}>
    发申请
  </Button>
  <Button size="sm" onClick={() => payRequest(u.id)}>
    付费加
  </Button>
</div>
        </Card>
      ))}
    </div>

{showPreview && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowPreview(false)}
        >
          <img
            src={previewImage ?? ''}
            className="max-w-[90%] max-h-[90%] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';





export default function HomePage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

const [wechatId, setWechatId] = useState('');
const [douyin, setDouyin] = useState('');
const [xhs, setXhs] = useState('');
const [saving, setSaving] = useState(false);
const [avatarUrl, setAvatarUrl] = useState('');
const [photo1, setPhoto1] = useState('');
const [photo2, setPhoto2] = useState('');
const [photo3, setPhoto3] = useState('');


const [showProfile, setShowProfile] = useState(false);




  const menuRef = useRef<HTMLDivElement>(null);

const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, photoField: 'photo1' | 'photo2' | 'photo3') => {
  if (!currentUser) return;

  const file = e.target.files?.[0];
  if (!file) return;

  const filePath = `photos/${currentUser.id}-${photoField}-${Date.now()}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) {
    alert("上传失败");
    return;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
  const url = data.publicUrl;

  // 更新对应状态
  if (photoField === 'photo1') setPhoto1(url);
  else if (photoField === 'photo2') setPhoto2(url);
  else if (photoField === 'photo3') setPhoto3(url);

  // 保存到数据库
  await supabase
    .from('users')
    .update({ [photoField]: url })
    .eq('id', currentUser.id);

  const updatedUser = { ...currentUser, [photoField]: url };
  setCurrentUser(updatedUser);
  localStorage.setItem('currentUser', JSON.stringify(updatedUser));
};

const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!currentUser) return;

  const file = e.target.files?.[0];
  if (!file) return;

  const filePath = `${currentUser.id}-${Date.now()}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) {
    alert("上传失败");
    return;
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  const url = data.publicUrl;

  setAvatarUrl(url);

  await supabase
    .from('users')
    .update({ avatar_url: url })
    .eq('id', currentUser.id);

  const updatedUser = {
    ...currentUser,
    avatar_url: url,
  };

  setCurrentUser(updatedUser);
  localStorage.setItem('currentUser', JSON.stringify(updatedUser));
};

  const logout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/register';
  };

  const [searchTerm, setSearchTerm] = useState('');



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

setWechatId(parsedUser.wechat_id || '');
setDouyin(parsedUser.douyin || '');
setXhs(parsedUser.xhs || '');
setAvatarUrl(parsedUser.avatar_url || '');
setPhoto1(parsedUser.photo1 || '');
setPhoto2(parsedUser.photo2 || '');
setPhoto3(parsedUser.photo3 || '');


    // 查询其他用户
    const fetchUsers = async () => {
      const { data: allUsers } = await supabase
        .from('users')
        .select('*')
        .neq('id', parsedUser.id) // 排除自己
.order('rank', { ascending: true, nullsLast: true });
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


const saveProfile = async () => {
  if (!currentUser) return;

  setSaving(true);

  const { error } = await supabase
    .from('users')
    .update({
      wechat_id: wechatId,
      douyin: douyin,
      xhs: xhs,
    })
    .eq('id', currentUser.id);

  setSaving(false);

  if (error) {
    alert('保存失败');
  } else {
    alert('保存成功');

    const updatedUser = {
      ...currentUser,
      wechat_id: wechatId,
      douyin,
      xhs,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  }
};

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

const filteredUsers = users.filter((u) => {
  const keyword = searchTerm.toLowerCase();
  return (
    u.wechat_id?.toLowerCase().includes(keyword) ||
    u.douyin?.toLowerCase().includes(keyword) ||
    u.xhs?.toLowerCase().includes(keyword)
  );
});

  return (

<div className="bg-gray-100 min-h-screen pt-2 px-4 pb-4">

<div className="">
  <input
    type="text"
    placeholder="搜索抖音 / 小红书号"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-2/3 p-2 px-4 rounded-xl text-sm bg-white outline-none"
  />
</div>



<div
  className={`overflow-hidden transition-all duration-500 ease-in-out ${
    showProfile ? "max-h-[400px] opacity-100 mt-4" : "max-h-0 opacity-0"
  }`}
>
<Card className="p-6 px-24 flex flex-col items-start rounded-3xl border-2 border-dashed border-[#a6acc4] shadow-none bg-white w-1/2">

<div className="flex items-center gap-4">
  
<div className="mb-6">
    
    <label className="block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          className="w-20 h-20 rounded-full mx-auto object-cover"
        />
      ) : (
        <div className="text-gray-400 text-sm">
          点击上传头像
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />
    </label>
  </div>

<div className="flex gap-2 mb-6">
  {['photo1','photo2','photo3'].map((field, index) => {
    const url = field === 'photo1' ? photo1 : field === 'photo2' ? photo2 : photo3;
    return (
      <label key={field} className="w-16 h-16 border-2 border-dashed rounded-xl cursor-pointer overflow-hidden flex items-center justify-center hover:bg-gray-50 transition">
        {url ? (
          <img src={url} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-xs">上传</span>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePhotoChange(e, field as 'photo1'|'photo2'|'photo3')}
        />
      </label>
    );
  })}
</div>
 </div>


  <input
    value={wechatId}
    onChange={(e) => setWechatId(e.target.value)}
    placeholder="微信号"
    className="border rounded-md px-3 py-2 text-xs mb-3 w-full border-[#878dab] placeholder-[#5f69a1]"
  />


  <Button
    onClick={saveProfile}
    disabled={saving}
    className="cursor-pointer bg-[#2d60d7] text-xs"
  >
    {saving ? "保存中..." : "保存"}
  </Button>

</Card>
</div>


<div className="fixed top-3 right-3 z-50 flex items-center gap-3">



<button
  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border-none cursor-pointer"
  onClick={() => {
    setShowProfile(!showProfile);
  }}
>
  <div className="relative w-3.5 h-3.5">
    <span className="absolute left-1/2 top-0 w-[2px] h-full bg-black -translate-x-1/2"></span>
    <span className="absolute top-1/2 left-0 h-[2px] w-full bg-black -translate-y-1/2"></span>
  </div>
</button>

<div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 cursor-pointer"
tabIndex={-1}
        >
<div className="flex gap-[2.5px] -translate-y-[2.5px]">
  <span className="w-[3px] h-[3px] bg-black rounded-full"></span>
  <span className="w-[3px] h-[3px] bg-black rounded-full"></span>
  <span className="w-[3px] h-[3px] bg-black rounded-full"></span>
</div>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-xl w-34 py-2">
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => (window.location.href = '/requests')}
            >
              收到的申请
            </button>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => (window.location.href = '/matches')}
            >
              好友
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
      </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">


      {filteredUsers.map((u) => (
        <Card key={u.id} className="p-12 flex flex-col items-start rounded-3xl border-none shadow-none bg-white">
          <img
            src={u.avatar_url}
            className="w-24 h-24 rounded-full object-cover mb-4 border"
            alt="avatar"
  onClick={() => {
  setPreviewImage(u.avatar_url);
  setShowPreview(true);
  }}
          />
          <p className="font-medium">
            {u.wechat_id
              ? u.wechat_id.charAt(0) + '***'
              : '***'}
          </p>
{u.douyin && (
  <p className="font-small text-sm mt-2">
    抖音：{u.douyin}
  </p>
)}

{u.xhs && (
  <p className="font-small text-sm mt-2">
    小红书号：{u.xhs}
  </p>
)}

<div className="flex gap-3 mt-4">
  <Button
variant="outline"
className="flex-1 cursor-pointer"
onClick={() => sendRequest(u.id)}>
    发申请
  </Button>
  <Button
variant="outline"
className="flex-1 cursor-pointer"
onClick={() => payRequest(u.id)}>
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
            src={previewImage}
            className="max-w-[90%] max-h-[90%] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
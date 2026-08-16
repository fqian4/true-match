'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from "lucide-react";




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
const [photos, setPhotos] = useState<string[]>([]);
const [photoInputKey, setPhotoInputKey] = useState(0);

const [showProfile, setShowProfile] = useState(false);

const [showAddModal, setShowAddModal] = useState(false);
const [selectedUserId, setSelectedUserId] = useState<string | null>(null);


  const menuRef = useRef<HTMLDivElement>(null);

const handlePhotoChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!currentUser) return;

  const file = e.target.files?.[0];
  if (!file) return;

  // 最多4张
  if (photos.length >= 4) {
    alert("最多上传4张");
    return;
  }

  const filePath = `${currentUser.id}/photo-${Date.now()}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file);

  if (error) {
    alert("上传失败");
    return;
  }

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const url = data.publicUrl;

  const newPhotos = [...photos, url];

  setPhotos(newPhotos);

  await supabase
    .from("users")
    .update({
      photos: newPhotos,
    })
    .eq("id", currentUser.id);

  const updatedUser = {
    ...currentUser,
    photos: newPhotos,
  };

  setCurrentUser(updatedUser);
  localStorage.setItem(
    "currentUser",
    JSON.stringify(updatedUser)
  );
setPhotoInputKey(k => k + 1);
};

const handleDeletePhoto = async (index: number) => {
  if (!currentUser) return;

  const newPhotos = photos.filter((_, i) => i !== index);

  setPhotos(newPhotos);

  await supabase
    .from("users")
    .update({
      photos: newPhotos,
    })
    .eq("id", currentUser.id);

  const updatedUser = {
    ...currentUser,
    photos: newPhotos,
  };

  setCurrentUser(updatedUser);
  localStorage.setItem(
    "currentUser",
    JSON.stringify(updatedUser)
  );
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

const handleDeleteAvatar = async () => {
  if (!currentUser) return;

  // 清空状态
  setAvatarUrl('');

  // 更新数据库
  const { error } = await supabase
    .from('users')
    .update({ avatar_url: '' })
    .eq('id', currentUser.id);

  if (error) {
    alert('删除失败');
  } else {
    const updatedUser = { ...currentUser, avatar_url: '' };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  }
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
setPhotos(parsedUser.photos || []);


    // 查询其他用户
    const fetchUsers = async () => {
      const { data: allUsers } = await supabase
        .from('users')
        .select('*')
        .neq('id', parsedUser.id) // 排除自己
.order('rank', { ascending: true });
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

  const pwd = prompt("请输入新密码：");

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
    placeholder="搜索"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-2/3 p-2 px-4 rounded-xl text-sm bg-white outline-none"
  />
</div>






<div className="fixed top-3 right-3 z-50 flex items-center gap-3">





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
      onClick={() => {
        setShowProfile(true);
        setMenuOpen(false);
      }}
    >
      个人资料
    </button>


<button
  className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
  onClick={handleSetPassword}
>
  密码
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
        <Card key={u.id} className="p-6 rounded-lg border-none shadow-none bg-white">

<div className="flex items-center gap-4 mb-4">

{u.douyin && (
  <p className="font-small mb-0">
    抖音号：{u.douyin}
  </p>
)}

{u.xhs && (
  <p className="mb-0">
    小红书：{u.xhs}
  </p>
)}

         

</div>



{u.photos?.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {u.photos.map((photo: string, index: number) => (
        <img
          key={index}
          src={photo}
          className="w-18 h-18 object-cover rounded-lg cursor-pointer mb-4"
          onClick={() => {
            setPreviewImage(photo);
            setShowPreview(true);
          }}
        />
      ))}
    </div>
  )}


<div className="flex items-start gap-6">

{(!u.photos || u.photos.length === 0) && u.avatar_url && (
          <img
            src={u.avatar_url}
            className="w-18 h-18 object-cover rounded-lg mb-4 border"
            alt="avatar"
  onClick={() => {
  setPreviewImage(u.avatar_url);
  setShowPreview(true);
  }}
          />
)}

 <p className="font-medium mb-0">
            {u.wechat_id
              ? u.wechat_id.charAt(0) + '***'
              : '***'}
          </p>

</div>

<div className="flex items-center gap-4">



<Button
  variant="ghost"
  className="w-fit cursor-pointer bg-gray-100 text-gray-600 border-0 shadow-none hover:bg-gray-200 hover:shadow-none"
  onClick={() => {
    setSelectedUserId(u.id);
    setShowAddModal(true);
  }}
>
  <Plus className="h-6 w-6 stroke-[2]" />
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
{previewImage && (
          <img
            src={previewImage}
            className="max-w-[90%] max-h-[90%] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
)}
        </div>
      )}


{showProfile && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={() => setShowProfile(false)}
  >
    <div
      className="bg-white rounded-2xl p-6 w-[340px]"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-center text-lg font-medium mb-5">
        编辑个人资料
      </h3>

      {/* 头像 */}
      <div className="flex flex-col items-center mb-5">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border"
          />
        ) : (
          <div className="w-24 h-24 rounded-full border flex items-center justify-center text-gray-400">
            无头像
          </div>
        )}

        <input
          id="avatarInput"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <label
          htmlFor="avatarInput"
          className="mt-3 text-sm text-blue-500 cursor-pointer"
        >
          更换头像
        </label>

        {avatarUrl && (
          <button
            className="mt-2 text-sm text-red-500"
            onClick={handleDeleteAvatar}
          >
            删除头像
          </button>
        )}
      </div>




      {/* 抖音 */}
      <input
        type="text"
        value={douyin}
        onChange={(e) => setDouyin(e.target.value)}
        placeholder="抖音"
        className="w-full border rounded-lg p-2 mb-3 text-sm"
      />

      {/* 小红书 */}
      <input
        type="text"
        value={xhs}
        onChange={(e) => setXhs(e.target.value)}
        placeholder="小红书"
        className="w-full border rounded-lg p-2 mb-3 text-sm"
      />

      <input
        type="text"
        value={xhs}
        onChange={(e) => setXhs(e.target.value)}
        placeholder="无畏契约"
        className="w-full border rounded-lg p-2 mb-5 text-sm"
      />

<div className="mt-5">
  <p className="mb-2 text-sm font-medium">
    照片（最多4张）
  </p>

  <div className="grid grid-cols-2 gap-3">

    {photos.map((photo, index) => (
      <div
        key={index}
        className="relative"
      >
        <img
          src={photo}
          className="w-full aspect-square rounded-lg object-cover border"
        />

        <button
          onClick={() => handleDeletePhoto(index)}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white"
        >
          ×
        </button>
      </div>
    ))}

    {photos.length < 4 && (
      <>

        <input
key={photoInputKey}
          id="photoInput"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />

        <label
          htmlFor="photoInput"
          className="border rounded-lg aspect-square flex items-center justify-center cursor-pointer text-3xl text-gray-400"
        >
          +
        </label>
      </>
    )}

  </div>
</div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setShowProfile(false)}
        >
          取消
        </Button>

        <Button
          className="flex-1"
          onClick={async () => {
            await saveProfile();
            setShowProfile(false);
          }}
        >
          保存
        </Button>
      </div>
    </div>
  </div>
)}


{showAddModal && (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={() => setShowAddModal(false)}
  >
    <div
      className="bg-white rounded-2xl p-6 w-72"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-center font-medium mb-4">
        选择添加方式
      </h3>

      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          onClick={() => {
            if (selectedUserId) {
              sendRequest(selectedUserId);
            }
            setShowAddModal(false);
          }}
        >
          加好友
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            if (selectedUserId) {
              payRequest(selectedUserId);
            }
            setShowAddModal(false);
          }}
        >
          付费加
        </Button>

        <Button
          variant="ghost"
          onClick={() => setShowAddModal(false)}
        >
          取消
        </Button>
      </div>
    </div>
  </div>
)}


    </div>
  );
}


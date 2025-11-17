'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function PayPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-xl font-bold mb-4">收款码</h1>

      <Image
        src="/pay.png"
        width={260}
        height={260}
        alt="付款二维码"
        className="mb-4"
      />
<p className="mb-4">请扫码支付200元完成后点击已支付按钮</p>
      <button
        onClick={() => router.push('/')}
        className="bg-green-500 text-white px-6 py-2 rounded"
      >
        已支付
      </button>
    </div>
  );
}

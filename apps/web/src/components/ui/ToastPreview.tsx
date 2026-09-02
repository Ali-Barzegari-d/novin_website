'use client';

import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/useToast';

function ToastPreview() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        onClick={() =>
          toast({
            title: 'درخواست ثبت شد',
            description: 'می‌توانید شماره پیگیری را در حساب خود ببینید.',
            variant: 'success'
          })
        }
      >
        نمایش موفقیت
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          toast({
            title: 'نیاز به بازبینی',
            description: 'پیش از ادامه، داده‌های واردشده را بررسی کنید.',
            variant: 'warning'
          })
        }
      >
        نمایش هشدار
      </Button>
      <Button
        size="sm"
        variant="danger-ghost"
        onClick={() =>
          toast({
            title: 'ثبت انجام نشد',
            description: 'متن واردشده حفظ شده است؛ دوباره تلاش کنید.',
            variant: 'danger',
            type: 'foreground'
          })
        }
      >
        نمایش خطا
      </Button>
    </div>
  );
}

export { ToastPreview };

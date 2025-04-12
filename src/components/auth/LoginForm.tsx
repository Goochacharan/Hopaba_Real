
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const phoneLoginSchema = z.object({
  phone: z.string().min(10, "Please enter a valid phone number"),
  otp: z.string().optional(),
});

const otpSchema = z.object({
  phone: z.string(),
  otp: z.string().min(6, "Please enter a valid verification code"),
});

export type LoginFormValues = z.infer<typeof phoneLoginSchema> | z.infer<typeof otpSchema>;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  isLoading: boolean;
  isDisabled: boolean;
  showOTPInput?: boolean;
  phoneNumber?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  isDisabled,
  showOTPInput = false,
  phoneNumber = '',
}) => {
  const schema = showOTPInput ? otpSchema : phoneLoginSchema;
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      phone: phoneNumber || "",
      otp: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <div className="flex">
                  <div className="flex items-center bg-muted px-3 rounded-l-md border-y border-l">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    placeholder="+1234567890"
                    type="tel"
                    autoComplete="tel"
                    disabled={isLoading || isDisabled || showOTPInput}
                    className="rounded-l-none"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showOTPInput && (
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || isDisabled}
        >
          {isLoading ? "Processing..." : showOTPInput ? "Verify Code" : "Send Verification Code"}
        </Button>
      </form>
    </Form>
  );
};

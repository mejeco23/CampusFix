<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BrevoResetPassword extends Notification
{
    use Queueable;

    public function __construct(private readonly string $token) {}

    public function via(object $notifiable): array
    {
        return ['brevo'];
    }

    public function toBrevo(object $notifiable): array
    {
        $resetUrl = rtrim(config('app.frontend_url'), '/')
            .'/reset-password?token='.urlencode($this->token)
            .'&email='.urlencode($notifiable->getEmailForPasswordReset());

        return [
            'sender' => [
                'name' => config('mail.from.name', 'CampusFix'),
                'email' => config('mail.from.address'),
            ],
            'to' => [
                [
                    'email' => $notifiable->getEmailForPasswordReset(),
                    'name' => $notifiable->name,
                ],
            ],
            'subject' => 'Reset Your CampusFix Password',
            'htmlContent' => sprintf(
                '<h2>Password Reset</h2><p>Hello %s,</p><p>Click the link below to reset your CampusFix password:</p><p><a href="%s">Reset Password</a></p><p>If you did not request this, you can ignore this email.</p>',
                e($notifiable->name),
                e($resetUrl)
            ),
        ];
    }
}

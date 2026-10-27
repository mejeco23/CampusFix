<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class BrevoVerifyEmail extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['brevo'];
    }

    public function toBrevo(object $notifiable): array
    {
        $expiresInMinutes = (int) config('auth.verification.expire', 60);
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes($expiresInMinutes),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        return [
            'sender' => [
                'name' => config('mail.from.name', 'CampusFix'),
                'email' => config('mail.from.address'),
            ],
            'to' => [
                [
                    'email' => $notifiable->getEmailForVerification(),
                    'name' => $notifiable->name,
                ],
            ],
            'subject' => 'Verify your CampusFix email',
            'htmlContent' => '
                <h2>Welcome to CampusFix!</h2>
                <p>Please verify your email address to activate your account.</p>
                <p>
                    <a href="'.e($verificationUrl).'"
                       style="background:#d4a017;color:#111;padding:12px 18px;
                       text-decoration:none;border-radius:6px;">
                       Verify Email Address
                    </a>
                </p>
                <p>This verification link expires in '.$expiresInMinutes.' minutes.</p>
                <p>If you did not create a CampusFix account, you can ignore this email.</p>
            ',
        ];
    }
}

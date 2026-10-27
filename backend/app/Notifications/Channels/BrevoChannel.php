<?php

namespace App\Notifications\Channels;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class BrevoChannel
{
    public function send(object $notifiable, Notification $notification): void
    {
        $apiKey = config('services.brevo.key');
        $senderEmail = config('mail.from.address');

        if (! $apiKey || ! $senderEmail) {
            throw new RuntimeException('Brevo email delivery is not configured.');
        }

        try {
            $response = Http::acceptJson()
                ->withHeaders(['api-key' => $apiKey])
                ->connectTimeout(5)
                ->timeout(10)
                ->post('https://api.brevo.com/v3/smtp/email', $notification->toBrevo($notifiable));
        } catch (ConnectionException) {
            throw new RuntimeException('Brevo email delivery is temporarily unavailable.');
        }

        if (! $response->successful()) {
            throw new RuntimeException(
                'Brevo email API failed with HTTP status '.$response->status()
            );
        }
    }
}

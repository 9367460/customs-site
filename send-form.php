<?php
// Защита от прямого доступа
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(403);
    exit('Доступ запрещен');
}

// Настройки
$to_email = 'info@customs-consulting.ru';
$from_email = 'noreply@customs-consulting.ru';
$subject = 'Новая заявка с сайта customs-consulting.ru';

// Получение данных из формы
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Валидация
$errors = [];

if (empty($name)) {
    $errors[] = 'Пожалуйста, укажите ваше имя';
}

if (empty($phone)) {
    $errors[] = 'Пожалуйста, укажите телефон';
}

if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Некорректный email адрес';
}

// Если есть ошибки
if (!empty($errors)) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'errors' => $errors
    ]);
    exit;
}

// Подготовка текста письма
$email_body = "Новая заявка с сайта customs-consulting.ru\n\n";
$email_body .= "Имя: " . htmlspecialchars($name) . "\n";
$email_body .= "Телефон: " . htmlspecialchars($phone) . "\n";
$email_body .= "Email: " . (!empty($email) ? htmlspecialchars($email) : 'Не указан') . "\n";
$email_body .= "Сообщение: " . (!empty($message) ? htmlspecialchars($message) : 'Запрос на обратный звонок') . "\n\n";
$email_body .= "---\n";
$email_body .= "Отправлено: " . date('d.m.Y H:i:s') . "\n";
$email_body .= "IP адрес: " . $_SERVER['REMOTE_ADDR'] . "\n";

// Заголовки письма
$headers = [];
$headers[] = 'From: ' . $from_email;
$headers[] = 'Reply-To: ' . (!empty($email) ? $email : $from_email);
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'X-Mailer: PHP/' . phpversion();

// Отправка письма
$mail_sent = mail($to_email, $subject, $email_body, implode("\r\n", $headers));

// Отправка лида в Битрикс24
$bitrix_webhook = getenv('BITRIX24_WEBHOOK_URL');

if ($bitrix_webhook) {
    $lead_fields = [
        'TITLE'              => 'Заявка с сайта customs-consulting.ru — ' . $name,
        'NAME'               => $name,
        'SOURCE_ID'          => 'WEB',
        'SOURCE_DESCRIPTION' => 'Заявка с сайта customs-consulting.ru',
        'COMMENTS'           => (!empty($message) ? $message : 'Запрос на обратный звонок'),
    ];

    if (!empty($phone)) {
        $lead_fields['PHONE'] = [['VALUE' => $phone, 'VALUE_TYPE' => 'WORK']];
    }
    if (!empty($email)) {
        $lead_fields['EMAIL'] = [['VALUE' => $email, 'VALUE_TYPE' => 'WORK']];
    }

    $ch = curl_init($bitrix_webhook);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['fields' => $lead_fields]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_exec($ch);
    curl_close($ch);
}

// Ответ
header('Content-Type: application/json; charset=utf-8');

if ($mail_sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Спасибо за заявку! Мы свяжемся с вами в ближайшее время.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Произошла ошибка при отправке. Пожалуйста, позвоните нам по телефону +7 (931) 255-44-55'
    ]);
}

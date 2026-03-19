# Добавление ссылок на документы в футер

## Краткая инструкция

### 1. HTML структура

Добавьте в `footer.html` в блок `footer__bottom`:

```html
<div class="footer__documents">
    <a href="files/document1.pdf" class="footer__document-link" target="_blank" rel="noopener noreferrer" aria-label="Открыть документ 1 в новой вкладке">Название документа 1</a>
    <span class="footer__document-separator">•</span>
    <a href="files/document2.pdf" class="footer__document-link" download aria-label="Скачать документ 2">Название документа 2</a>
</div>
```

**Важно:**
- Для PDF используйте `target="_blank"` чтобы открывалось в новой вкладке
- Для DOCX/других форматов используйте `download` чтобы скачивалось
- Пути относительные: `files/filename.pdf` (не `/files/...`)

### 2. CSS стили

Добавьте в `footer.scss` после `.footer__bottom`:

```scss
// .footer__bottom
&__bottom {
    text-align: center;
    padding-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;

    @media (min-width: 768px) {
        flex-direction: row;
        justify-content: center;
        gap: 24px;
    }
}

// .footer__documents
&__documents {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
}

// .footer__document-link
&__document-link {
    font-size: 13px;
    color: #6b7280;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
        color: $accent;
        text-decoration: underline;
    }

    &:active,
    &:focus {
        color: $accent;
    }
}

// .footer__document-separator
&__document-separator {
    font-size: 13px;
    color: #9ca3af;
}
```

### 3. Размещение файлов

1. Поместите файлы в папку `src/files/`
2. При сборке (`npm run build`) файлы автоматически копируются в `dist/files/`
3. Убедитесь, что в `template.config.js` установлено `copyfiles: true`

### 4. Настройка путей

- **Относительные пути:** `files/filename.pdf` (рекомендуется)
- **Абсолютные пути:** `/files/filename.pdf` (работает только если сайт в корне домена)

### Пример использования

```html
<div class="footer__documents">
    <a href="files/requisites.pdf" class="footer__document-link" target="_blank" rel="noopener noreferrer">Реквизиты</a>
    <span class="footer__document-separator">•</span>
    <a href="files/offer.pdf" class="footer__document-link" target="_blank" rel="noopener noreferrer">Договор оферты</a>
</div>
```

## Готово!

После сборки и деплоя ссылки будут работать на всех страницах сайта.


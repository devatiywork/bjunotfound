/**
 * Кастомный функционал для Swagger UI
 * Добавляет кнопки копирования всей информации о роуте
 */

window.addEventListener('load', function () {
  setTimeout(() => {
    addCopyButtons();
    const observer = new MutationObserver(addCopyButtons);
    observer.observe(document.querySelector('.swagger-ui'), {
      childList: true,
      subtree: true,
    });
  }, 1000);
});

function addCopyButtons() {
  const operations = document.querySelectorAll('.opblock');
  operations.forEach((operation) => {
    if (operation.querySelector('.copy-all-button')) return;

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-all-button';
    copyButton.style.cssText =
      'margin-left:10px;padding:5px 10px;background:#4990e2;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;font-weight:600;';
    copyButton.textContent = '📋 Копировать всё';
    copyButton.addEventListener('click', (e) => {
      e.stopPropagation();
      copyEndpointInfo(operation);
    });

    const summary = operation.querySelector('.opblock-summary');
    if (summary) summary.appendChild(copyButton);
  });
}

function copyEndpointInfo(operation) {
  const method = operation
    .querySelector('.opblock-summary-method')
    ?.textContent.trim();
  const path = operation
    .querySelector('.opblock-summary-path')
    ?.textContent.trim();
  const summary = operation
    .querySelector('.opblock-summary-description')
    ?.textContent.trim();

  const isExpanded = operation.classList.contains('is-open');
  if (!isExpanded) {
    operation.querySelector('.opblock-summary')?.click();
    setTimeout(() => extractAndCopy(operation, method, path, summary), 600);
  } else {
    extractAndCopy(operation, method, path, summary);
  }
}

function extractAndCopy(operation, method, path, summary) {
  const description =
    operation.querySelector('.opblock-description-wrapper p')?.textContent ||
    '';

  // Извлекаем параметры (path, query, header)
  let parameters = [];
  operation.querySelectorAll('.parameters tbody tr').forEach((row) => {
    const name = row.querySelector('.parameter__name')?.textContent.trim();
    const type = row.querySelector('.parameter__type')?.textContent.trim();
    const required = row.querySelector('.parameter__name.required')
      ? 'обязательный'
      : 'опциональный';
    const desc =
      row.querySelector('.parameter__description')?.textContent.trim() || '';
    if (name)
      parameters.push(
        '  - ' + name + ' (' + type + ') [' + required + ']: ' + desc,
      );
  });

  // Извлекаем тело запроса (Request Body) - улучшенная версия
  let requestBodyExample = '';
  const requestBodySection = operation.querySelector('.request-body');
  if (requestBodySection) {
    // Ищем в .body-param__example или .body-param
    const bodyParamExample = requestBodySection.querySelector(
      '.body-param__example',
    );
    if (bodyParamExample) {
      requestBodyExample = bodyParamExample.textContent.trim();
    } else {
      const bodyParam = requestBodySection.querySelector('.body-param');
      if (bodyParam) {
        requestBodyExample = bodyParam.textContent.trim();
      }
    }
    // Если не нашли, ищем в microlight (подсветка кода)
    if (!requestBodyExample) {
      const microlight = requestBodySection.querySelector('.microlight');
      if (microlight) {
        requestBodyExample = microlight.textContent.trim();
      }
    }
  }

  // Извлекаем все ответы (Responses) - очищенная версия
  let responses = [];
  const responsesWrapper = operation.querySelector('.responses-wrapper');
  if (responsesWrapper) {
    responsesWrapper.querySelectorAll('.response').forEach((responseBlock) => {
      const codeEl = responseBlock.querySelector('.response-col_status');
      const descEl = responseBlock.querySelector(
        '.response-col_description .markdown p, .response-col_description p',
      );

      if (codeEl) {
        const code = codeEl.textContent.trim();
        // Очищаем описание от лишнего текста
        let desc = '';
        if (descEl) {
          desc = descEl.textContent.trim();
        }

        // Извлекаем только JSON из примера
        let example = '';
        const highlightCode = responseBlock.querySelector(
          '.highlight-code .microlight',
        );
        if (highlightCode) {
          example = highlightCode.textContent.trim();
        }

        // Если не нашли через highlight-code, пробуем body-param
        if (!example) {
          const bodyParam = responseBlock.querySelector('.body-param');
          if (bodyParam) {
            example = bodyParam.textContent.trim();
          }
        }

        responses.push({ code, description: desc, example });
      }
    });
  }

  // Формируем полный текст для копирования
  let copyText =
    '\n╔════════════════════════════════════════════════════════════════\n';
  copyText += '║ ' + method.toUpperCase() + ' ' + path + '\n';
  copyText +=
    '╚════════════════════════════════════════════════════════════════\n\n';
  copyText += '📝 ОПИСАНИЕ:\n' + summary;
  if (description) copyText += '\n' + description;
  copyText += '\n';

  if (parameters.length > 0) {
    copyText += '\n📋 ПАРАМЕТРЫ:\n' + parameters.join('\n') + '\n';
  }

  if (requestBodyExample) {
    copyText +=
      '\n📤 ТЕЛО ЗАПРОСА (Request Body):\n' + requestBodyExample + '\n';
  }

  if (responses.length > 0) {
    copyText += '\n📥 ВОЗМОЖНЫЕ ОТВЕТЫ:\n';
    responses.forEach((r) => {
      copyText +=
        '\n  ▸ ' + r.code + (r.description ? ' - ' + r.description : '') + '\n';
      if (r.example) {
        copyText += '\n' + r.example + '\n';
      }
    });
  }

  copyText +=
    '\n────────────────────────────────────────────────────────────────\n';
  copyText += '🔗 CURL КОМАНДА:\n';
  copyText +=
    'curl -X ' +
    method.toUpperCase() +
    ' "http://localhost:5000' +
    path +
    '" \\\n';
  copyText += '  -H "Authorization: Bearer YOUR_TOKEN" \\\n';
  copyText += '  -H "Content-Type: application/json"';
  if (requestBodyExample) {
    // Минифицируем JSON для curl (убираем переносы)
    const minified = requestBodyExample.replace(/\s+/g, ' ').replace(/\n/g, '');
    copyText += " \\\n  -d '" + minified + "'";
  }
  copyText +=
    '\n────────────────────────────────────────────────────────────────';

  navigator.clipboard
    .writeText(copyText.trim())
    .then(() => {
      showNotification('✓ Информация скопирована!', 'success');
    })
    .catch((err) => {
      console.error('Ошибка копирования:', err);
      showNotification('Ошибка при копировании', 'error');
    });
}

function showNotification(message, type) {
  const oldNotification = document.querySelector('.copy-notification');
  if (oldNotification) oldNotification.remove();

  const notification = document.createElement('div');
  notification.className = 'copy-notification';
  notification.style.cssText =
    'position:fixed;top:20px;right:20px;padding:15px 20px;background:' +
    (type === 'success' ? '#4CAF50' : '#f44336') +
    ';color:white;border-radius:4px;box-shadow:0 4px 6px rgba(0,0,0,0.2);z-index:10000;font-size:14px;font-weight:500;animation:slideIn 0.3s ease;';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

const style = document.createElement('style');
style.textContent =
  '@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } } .copy-all-button:hover { background: #357ABD !important; transform: scale(1.05); transition: all 0.2s; } .copy-all-button:active { transform: scale(0.95); }';
document.head.appendChild(style);

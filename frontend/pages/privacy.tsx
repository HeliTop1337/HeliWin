import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Privacy() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Back button */}
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition mb-6">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            На главную
          </Link>

          <div className="glass rounded-3xl p-8">
            <h1 className="text-4xl font-bold mb-6">Политика конфиденциальности</h1>
            <p className="text-muted-foreground mb-8">Последнее обновление: 02 февраля 2026</p>

            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-bold mb-3">1. Введение</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Добро пожаловать в HeliWin. Мы уважаем вашу конфиденциальность и стремимся защитить ваши персональные данные. 
                  Эта политика конфиденциальности объясняет, как мы собираем, используем и защищаем вашу информацию.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">2. Собираемая информация</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Мы собираем следующие типы информации:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Имя пользователя и адрес электронной почты при регистрации</li>
                  <li>Информация об игровой активности (открытые кейсы, выигрыши)</li>
                  <li>Данные о транзакциях и балансе</li>
                  <li>IP-адрес и информация об устройстве</li>
                  <li>Cookies и данные сеанса</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">3. Использование информации</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Мы используем собранную информацию для:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Предоставления и улучшения наших услуг</li>
                  <li>Обработки транзакций и управления вашим аккаунтом</li>
                  <li>Обеспечения безопасности и предотвращения мошенничества</li>
                  <li>Связи с вами по поводу обновлений и акций</li>
                  <li>Анализа использования платформы</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">4. Защита данных</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Мы применяем современные меры безопасности для защиты ваших данных:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                  <li>Шифрование паролей с использованием bcrypt</li>
                  <li>Защищенные JWT токены для аутентификации</li>
                  <li>HTTPS соединение для всех передач данных</li>
                  <li>Регулярные проверки безопасности</li>
                  <li>Ограничение доступа к персональным данным</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">5. Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Мы используем cookies для улучшения вашего опыта использования сайта. Cookies помогают нам запоминать ваши 
                  предпочтения, поддерживать сеанс входа и анализировать трафик. Вы можете отключить cookies в настройках 
                  браузера, но это может ограничить функциональность сайта.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">6. Передача данных третьим лицам</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Мы не продаем и не передаем ваши персональные данные третьим лицам, за исключением случаев:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                  <li>Когда это требуется по закону</li>
                  <li>Для обработки платежей (через защищенные платежные системы)</li>
                  <li>С вашего явного согласия</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">7. Ваши права</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Вы имеете право:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Получить доступ к своим персональным данным</li>
                  <li>Исправить неточные данные</li>
                  <li>Удалить свой аккаунт и данные</li>
                  <li>Отозвать согласие на обработку данных</li>
                  <li>Экспортировать свои данные</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">8. Возрастные ограничения</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Наш сервис предназначен для пользователей старше 18 лет. Мы не собираем намеренно информацию от лиц 
                  младше 18 лет. Если вы узнали, что несовершеннолетний предоставил нам персональные данные, пожалуйста, 
                  свяжитесь с нами.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">9. Изменения в политике</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Мы можем обновлять эту политику конфиденциальности время от времени. Мы уведомим вас о любых существенных 
                  изменениях, разместив новую политику на этой странице и обновив дату "Последнее обновление" вверху.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">10. Контакты</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Если у вас есть вопросы о нашей политике конфиденциальности или обработке ваших данных, пожалуйста, 
                  свяжитесь с нами:
                </p>
                <div className="mt-3 glass rounded-xl p-4">
                  <p className="text-muted-foreground">Email: <span className="text-primary">privacy@heliwin.com</span></p>
                  <p className="text-muted-foreground">Поддержка: <span className="text-primary">support@heliwin.com</span></p>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

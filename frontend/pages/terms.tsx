import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Terms() {
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
            <h1 className="text-4xl font-bold mb-6">Условия использования</h1>
            <p className="text-muted-foreground mb-8">Последнее обновление: 02 февраля 2026</p>

            <div className="space-y-6 text-foreground">
              <section>
                <h2 className="text-2xl font-bold mb-3">1. Принятие условий</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Используя платформу HeliWin, вы соглашаетесь с настоящими условиями использования. Если вы не согласны 
                  с какими-либо условиями, пожалуйста, не используйте наш сервис. Мы оставляем за собой право изменять 
                  эти условия в любое время.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">2. Описание сервиса</h2>
                <p className="text-muted-foreground leading-relaxed">
                  HeliWin - это развлекательная платформа для открытия виртуальных кейсов с предметами из вселенной Stalcraft. 
                  Сервис предоставляет возможность участвовать в открытии кейсов, батлах, апгрейдах предметов и других 
                  игровых активностях.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">3. Регистрация аккаунта</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Для использования сервиса вы должны:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Быть старше 18 лет</li>
                  <li>Предоставить точную и актуальную информацию при регистрации</li>
                  <li>Поддерживать безопасность своего пароля</li>
                  <li>Немедленно уведомлять нас о любом несанкционированном использовании аккаунта</li>
                  <li>Не создавать несколько аккаунтов</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">4. Правила использования</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  При использовании HeliWin запрещается:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Использовать сервис для незаконных целей</li>
                  <li>Пытаться получить несанкционированный доступ к системе</li>
                  <li>Использовать ботов, скрипты или автоматизированные средства</li>
                  <li>Манипулировать системой или эксплуатировать уязвимости</li>
                  <li>Оскорблять других пользователей или администрацию</li>
                  <li>Распространять вредоносное ПО или спам</li>
                  <li>Продавать или передавать свой аккаунт третьим лицам</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">5. Виртуальные предметы и валюта</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Все предметы и виртуальная валюта на платформе не имеют реальной денежной стоимости и предназначены 
                  исключительно для развлечения. Мы не гарантируем возможность обмена виртуальных предметов на реальные 
                  деньги или товары. Все транзакции являются окончательными.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">6. Платежи и возвраты</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Условия платежей:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Все платежи обрабатываются через защищенные платежные системы</li>
                  <li>Цены указаны в рублях и могут быть изменены без предварительного уведомления</li>
                  <li>Возврат средств возможен только в случае технической ошибки</li>
                  <li>Запросы на возврат должны быть отправлены в течение 48 часов</li>
                  <li>Мы оставляем за собой право отклонить запрос на возврат</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">7. Интеллектуальная собственность</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Все материалы на платформе HeliWin, включая дизайн, логотипы, графику и код, защищены авторским правом 
                  и являются собственностью HeliWin или наших партнеров. Предметы из вселенной Stalcraft являются 
                  собственностью их правообладателей.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">8. Ответственность</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  HeliWin не несет ответственности за:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Потерю виртуальных предметов или валюты из-за действий пользователя</li>
                  <li>Технические сбои или перерывы в работе сервиса</li>
                  <li>Действия третьих лиц</li>
                  <li>Любые косвенные или случайные убытки</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">9. Прекращение доступа</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Мы оставляем за собой право приостановить или прекратить ваш доступ к сервису в любое время без 
                  предварительного уведомления в случае нарушения этих условий, подозрительной активности или по любой 
                  другой причине на наше усмотрение.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">10. Изменения условий</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Мы можем изменять эти условия использования в любое время. Существенные изменения будут опубликованы 
                  на этой странице с обновленной датой. Продолжая использовать сервис после изменений, вы соглашаетесь 
                  с новыми условиями.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">11. Применимое право</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Эти условия регулируются законодательством Российской Федерации. Любые споры будут разрешаться в 
                  соответствии с законодательством РФ.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3">12. Контактная информация</h2>
                <p className="text-muted-foreground leading-relaxed">
                  По вопросам, связанным с условиями использования, обращайтесь:
                </p>
                <div className="mt-3 glass rounded-xl p-4">
                  <p className="text-muted-foreground">Email: <span className="text-primary">legal@heliwin.com</span></p>
                  <p className="text-muted-foreground">Поддержка: <span className="text-primary">support@heliwin.com</span></p>
                </div>
              </section>

              <div className="mt-8 p-4 glass rounded-xl border-l-4 border-primary">
                <p className="text-sm text-muted-foreground">
                  <strong>Важно:</strong> Используя HeliWin, вы подтверждаете, что прочитали, поняли и согласны с 
                  настоящими условиями использования и нашей политикой конфиденциальности.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

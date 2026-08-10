import { ChatWidget } from './ChatWidget'
import { BOOKSTORE_INTRO, EXAMPLE_PROMPTS } from '../../config/bookstorePrompts'
import { useChatLauncher } from '../../context/ChatLauncherContext'
import './WidgetHostPage.css'

export function WidgetHostPage() {
  const { requestPrompt } = useChatLauncher()

  return (
    <div className="widget-host">
      <header className="widget-host__nav">
        <span className="widget-host__logo">Books to Scrape</span>
        <nav aria-label="Primary">
          <a href="#try">Try it</a>
          <a href="#examples">Examples</a>
        </nav>
      </header>

      <main className="widget-host__main">
        <section className="widget-host__hero">
          <p className="widget-host__eyebrow">Demo bookstore chatbot</p>
          <h1>{BOOKSTORE_INTRO.title}</h1>
          <p>{BOOKSTORE_INTRO.description}</p>
          <p className="widget-host__hint">
            Click any example question below to open the chat and ask it automatically.
          </p>
        </section>

        <section id="examples" className="widget-host__examples">
          <h2>What you can ask</h2>
          <ul className="widget-host__example-list">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <li key={prompt}>
                <button
                  type="button"
                  className="widget-host__example-button"
                  onClick={() => requestPrompt(prompt)}
                >
                  {prompt}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section id="try" className="widget-host__grid">
          <article>
            <h2>Browse by genre</h2>
            <p>“Poetry books”, “romance books”, or “science fiction”.</p>
          </article>
          <article>
            <h2>Filter by price</h2>
            <p>“Books under £20”, “cheapest romance books”, or “over £30”.</p>
          </article>
          <article>
            <h2>Count &amp; details</h2>
            <p>“How many books under 20?” or “Tell me about Animal Farm”.</p>
          </article>
          <article>
            <h2>Follow-up questions</h2>
            <p>After a reply, try “tell me more” or “what about romance?”.</p>
          </article>
        </section>
      </main>

      <ChatWidget
        title={BOOKSTORE_INTRO.title}
        subtitle={BOOKSTORE_INTRO.tagline}
      />
    </div>
  )
}

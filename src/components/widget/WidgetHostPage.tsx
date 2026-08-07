import { ChatWidget } from './ChatWidget'
import './WidgetHostPage.css'

export function WidgetHostPage() {
  return (
    <div className="widget-host">
      <header className="widget-host__nav">
        <span className="widget-host__logo">Acme</span>
        <nav aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main className="widget-host__main">
        <section className="widget-host__hero">
          <p className="widget-host__eyebrow">Welcome</p>
          <h1>Build faster with our platform</h1>
          <p>
            This is a sample host page. The chatbot appears as a widget in the
            bottom-right corner — click the button to start a conversation.
          </p>
          <button type="button" className="widget-host__cta">
            Get started
          </button>
        </section>

        <section id="features" className="widget-host__grid">
          <article>
            <h2>Fast setup</h2>
            <p>Embed the widget on any page with a single script tag.</p>
          </article>
          <article>
            <h2>Streaming replies</h2>
            <p>Responses stream in real time over SSE.</p>
          </article>
          <article>
            <h2>Always available</h2>
            <p>Help visitors without leaving the page they are on.</p>
          </article>
        </section>
      </main>

      <ChatWidget />
    </div>
  )
}

import React from "react";
import Panel from "../components/Panel";
import { HELP_FAQ_CATEGORIES, HELP_SECTIONS } from "../content/helpCenterContent";

export default function HelpCenterPage() {
  return (
    <div className="page-grid">
      <section className="help-hero">
        <div>
          <p className="badge">Help Center</p>
          <h2>Learn how PulsePeak works without guessing.</h2>
          <p className="hero-text">
            This guide covers the product as it exists today, including free access, Premium weekly plan behavior,
            logging flows, coaching, and common troubleshooting steps.
          </p>
          <div className="help-hero-actions">
            <a className="secondary-button module-link" href="#getting-started">
              Start with setup
            </a>
            <a className="ghost-button module-link" href="#faq">
              Jump to FAQ
            </a>
          </div>
        </div>
      </section>

      <div className="help-layout">
        <aside className="help-sidebar">
          <div className="help-sidebar-card">
            <p className="section-label">On this page</p>
            <nav className="help-toc">
              {HELP_SECTIONS.map((section) => (
                <a href={`#${section.id}`} key={section.id}>
                  {section.label}
                </a>
              ))}
              <a href="#faq">FAQ</a>
            </nav>
          </div>
        </aside>

        <div className="help-content">
          {HELP_SECTIONS.map((section) => (
            <Panel key={section.id} eyebrow={section.eyebrow} title={section.title}>
              <article className="help-section" id={section.id}>
                <p className="help-summary">{section.summary}</p>
                <div className="help-blocks">
                  {section.blocks.map((block) => (
                    <section className="help-block" key={block.title}>
                      <h4>{block.title}</h4>
                      {block.body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </section>
                  ))}
                </div>
              </article>
            </Panel>
          ))}

          <Panel eyebrow="Quick answers" title="Frequently asked questions">
            <article className="help-section" id="faq">
              <div className="faq-groups">
                {HELP_FAQ_CATEGORIES.map((category) => (
                  <section className="faq-group" key={category.id}>
                    <h4>{category.title}</h4>
                    <div className="faq-list">
                      {category.items.map((item) => (
                        <details className="faq-item" key={item.question}>
                          <summary>{item.question}</summary>
                          <p>{item.answer}</p>
                        </details>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          </Panel>
        </div>
      </div>
    </div>
  );
}

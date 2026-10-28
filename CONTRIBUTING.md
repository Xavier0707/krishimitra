# Contributing to KrishiConnect AI

Thank you for your interest in contributing to **KrishiConnect AI**! We welcome contributions from software engineers, agronomists, translators, and agricultural data specialists.

## 🤝 Code of Conduct

Please review and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) in all project interactions.

## 🛠️ Development Setup

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local`.
4. Run development server:
   ```bash
   npm run dev
   ```
5. Run unit tests:
   ```bash
   npm run test
   ```

## 📋 Guidelines for Contributions

1. **Agronomic Verifiability**: Any recommendations for fertilizer dosages, disease diagnoses, or pesticide formulations must cite official agricultural sources (e.g. ICAR, State Agricultural Universities, KVKs).
2. **Rural India Accessibility**: Keep UI components responsive for budget mobile devices with viewport widths down to 320px.
3. **Bilingual Support**: When adding new user-facing copy, add both Hindi (`hi`) and English (`en`) strings in `lib/i18n/translations.ts`.
4. **Calculations**: Add unit tests in `tests/` for any changes made to unit conversions or financial calculations.
5. **No Secret Commits**: Never commit `.env` files or API keys.

## 🌿 Pull Request Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`.
2. Commit your changes: `git commit -m "feat: describe your change"`.
3. Push to your fork: `git push origin feature/your-feature-name`.
4. Open a Pull Request referencing any open issue.

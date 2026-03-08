# Sales CRM for Chile Territories

This is a SaaS CRM application designed for sales territories in Chile, built with Next.js and Supabase.

## Features

-   **Authentication**: User login and logout managed by Supabase Auth.
-   **Client Management**: View client details, including contact information and sales status.
-   **Activity Logging**: Log calls, emails, meetings, and tasks related to clients.
-   **Dashboard**: Executive view with key performance indicators (KPIs), geographical sales data, inactivity alerts, and recent activities.
-   **Task Management**: View and manage pending tasks.
-   **Row Level Security (RLS)**: Secure data access based on user roles (Reps, Admins).

## Getting Started

Follow these instructions to set up and run the project locally, and prepare it for deployment.

### 1. Environment Variables

Create a `.env.local` file in the root directory of your project with the following credentials:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```
Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual Supabase project URL and Anon Key.

### 2. Supabase Setup and Migrations

1.  **Create a New Supabase Project**: If you don't have one, create a new project on [Supabase](https://supabase.com/).
2.  **Get Supabase Credentials**: From your project settings, find the "API" section to get your Supabase URL and Anon Key.
3.  **Run Migrations**:
    *   Ensure you have the Supabase CLI installed. If not, follow the instructions [here](https://supabase.com/docs/guides/cli/getting-started).
    *   Link your local project to your Supabase project:
        ```bash
        supabase login
        supabase link --project-ref YOUR_PROJECT_REF
        ```
        (Replace `YOUR_PROJECT_REF` with your Supabase project reference, found in your project settings URL).
    *   Apply the migrations:
        ```bash
        supabase migration up
        ```
    *   This will apply the SQL scripts located in the `supabase/migrations` directory, setting up your database schema, functions, and RLS policies.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Admin User Setup

After running migrations and setting up your first user via the application's signup page (or Supabase Auth directly), you can promote a user to an 'admin' role directly in your Supabase database:

1.  Go to your Supabase project dashboard.
2.  Navigate to the 'Table Editor' and select the `profiles` table.
3.  Find the `id` of the user you want to make an admin.
4.  Update their `role` column to `'admin'` (make sure this column exists in your `profiles` table schema. If not, you may need to add it manually or via a migration).

## Deployment to Vercel

### Environment Variables for Vercel

When deploying to Vercel, make sure to set the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables in your Vercel project settings.

### Vercel.json (Optional)

A `vercel.json` file is generally not strictly needed for basic Next.js projects deployed on Vercel as Vercel automatically detects the framework. However, if you have specific build commands, funtion configurations or routing rules, you would add them here. For this project, it's not strictly required by default.

## Architecture and Scalability

This CRM leverages a modern stack based on Next.js for the frontend (with React Server Components and Client Components) and Supabase for the backend (PostgreSQL database, Authentication, Row Level Security, and Realtime capabilities).

### Scalability Considerations:

-   **Frontend (Next.js)**: Next.js provides excellent performance out-of-the-box with server-side rendering (SSR), static site generation (SSG), and incremental static regeneration (ISR). Vercel's platform ensures efficient scaling of the Next.js application.
-   **Backend (Supabase)**:
    *   **Database**: PostgreSQL is highly scalable and can be optimized with indexing, partitioning, and read replicas. Supabase manages the database infrastructure, allowing for easy vertical and horizontal scaling.
    *   **Authentication**: Supabase Auth handles user management and JWT token issuance, which can scale to millions of users.
    *   **RLS**: Row-Level Security provides fine-grained access control directly at the database level, ensuring data security as the user base grows.
    *   **Realtime**: Supabase Realtime allows for instant updates across clients, which is crucial for dynamic dashboards and activity feeds. It scales automatically to handle connections.
-   **Geographical Expansion**: The current data model includes `comunas` and `regions`, making it adaptable for wider geographical use within Chile. For international expansion, a more generic location model (e.g., countries, states/provinces) would be needed, along with potential multi-region database deployments.
-   **Complex Reporting**: For more complex analytical reports beyond basic KPIs, consider integrating specialized tools or building a data warehouse solution if the operational database becomes too strained. Supabase provides integrations with various data tools.
-   **API Integrations**: The architecture allows for easy integration with third-party APIs for features like email marketing, SMS notifications, or external analytics platforms.
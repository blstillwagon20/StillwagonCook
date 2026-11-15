# Stillwagon Cook

A simple recipe website the whole family can add to — no coding needed. It runs free on GitHub Pages.

## Put it online (one time, about 5 minutes)

1. Sign in to [github.com](https://github.com) and click **New repository** (the **+** in the top right).
2. Name it something like `family-cookbook`, leave it **Public**, and click **Create repository**.
3. On the new repo page, click **uploading an existing file**, drag in everything from this folder (including the `_layouts`, `_recipes` and `assets` folders), and click **Commit changes**.
4. Go to **Settings → Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, choose **main** and **/ (root)**, and click **Save**.
5. Wait a minute or two, refresh, and GitHub shows your site's address — something like `https://your-name.github.io/family-cookbook/`. Share that link with the family!

> Note: on free GitHub accounts, Pages sites are public. Anyone with the link can see them, but nobody can change them unless you invite them.

## Make it yours

Open `_config.yml` and change the `title`, `tagline` and `description` at the top.

## Add a recipe (anyone you invite can do this)

1. In the repo, open the `_recipes` folder.
2. Click **Add file → Create new file**.
3. Name it with dashes and `.md` on the end, like `grandma-roses-meatballs.md`.
4. Copy the contents of `recipe-template.md`, paste it in, and fill it out.
5. Click **Commit changes**. The site updates by itself in a minute or two.

Any recipe you add is automatically labeled **Stillwagon Cook 2.0**. The recipes from the original family cookbook are labeled **Stillwagon Cook: Original Recipe**.

A few rules for the top section (between the `---` lines):

- Keep each line as `label: value`.
- If a value contains a colon, wrap it in quotes, e.g. `title: "Pie: The Sequel"`.
- Use the same spelling for categories (e.g. always `Desserts`) so the filter buttons stay tidy.

### Garden recipes

For recipes made with fresh garden produce (peppers, zucchini, tomatoes and so on), add this line to the top section:

```
tags: [Garden]
```

The recipe gets a 🌱 Garden label and shows up under the Garden filter button.

### Adding a photo

Upload the picture into `assets/photos/`, then add a line to the recipe's top section:

```
image: /assets/photos/meatballs.jpg
```

Smaller photos (under ~1 MB) load faster.

## Let family members edit

In the repo, go to **Settings → Collaborators → Add people** and invite them by GitHub username or email. They'll need a free GitHub account.

## Remove the samples

Delete the three sample recipes in `_recipes/` once you've added real ones.

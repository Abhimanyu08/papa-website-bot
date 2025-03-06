import { Octokit } from "@octokit/rest";
import hi2en from "./hi2en.js";

export class GitHubService {
	constructor() {
		try {
			this.octokit = new Octokit({
				auth: process.env.GITHUB_TOKEN,
			});
			this.owner = process.env.GITHUB_OWNER;
			this.repo = process.env.GITHUB_REPO;
			console.log("GitHubService initialized successfully");
		} catch (error) {
			console.error("Error initializing GitHubService:", error);
			throw error;
		}
	}

	async createEssayCommit(title, content, date) {
		try {
			console.log(`Starting to create essay commit for: ${title}`);

			// Get the latest commit SHA
			console.log("Fetching latest commit SHA...");
			const main = await this.octokit.repos.getBranch({
				owner: this.owner,
				repo: this.repo,
				branch: "main",
			});
			const latestCommitSha = main.data.commit.sha;
			console.log(`Latest commit SHA: ${latestCommitSha}`);

			// Create blob with file content
			console.log("Creating blob with file content...");
			const blob = await this.octokit.git.createBlob({
				owner: this.owner,
				repo: this.repo,
				content: Buffer.from(content).toString("base64"),
				encoding: "base64",
			});
			console.log(`Blob created with SHA: ${blob.data.sha}`);

			// Create tree
			const filePath = `posts/${date}-${this.slugify(title)}.md`;
			console.log(`Creating tree with file path: ${filePath}`);
			const tree = await this.octokit.git.createTree({
				owner: this.owner,
				repo: this.repo,
				base_tree: latestCommitSha,
				tree: [
					{
						path: filePath,
						mode: "100644",
						type: "blob",
						sha: blob.data.sha,
					},
				],
			});
			console.log(`Tree created with SHA: ${tree.data.sha}`);

			// Create commit
			console.log("Creating commit...");
			const commit = await this.octokit.git.createCommit({
				owner: this.owner,
				repo: this.repo,
				message: `Add new essay: ${title}`,
				tree: tree.data.sha,
				parents: [latestCommitSha],
			});
			console.log(`Commit created with SHA: ${commit.data.sha}`);

			// Update main branch reference
			console.log("Updating main branch reference...");
			await this.octokit.git.updateRef({
				owner: this.owner,
				repo: this.repo,
				ref: "heads/main",
				sha: commit.data.sha,
				force: true,
			});
			console.log("Main branch reference updated successfully");

			return true;
		} catch (error) {
			console.error("Error creating commit:", error);
			console.error("Error details:", error.message);
			console.error("Error stack:", error.stack);
			if (error.response) {
				console.error("GitHub API response:", {
					status: error.response.status,
					data: error.response.data,
				});
			}
			throw error;
		}
	}

	slugify(text) {
		try {
			console.log(`Slugifying text: ${text}`);
			const title = text.replace(/[\\/:*?"<>|]/g, "_").substring(0, 50);
			const safeTitle = hi2en(title).replace(/ /g, "-");
			console.log(`Slugified result: ${safeTitle}`);
			return safeTitle;
		} catch (error) {
			console.error("Error in slugify function:", error);
			throw error;
		}
	}
}

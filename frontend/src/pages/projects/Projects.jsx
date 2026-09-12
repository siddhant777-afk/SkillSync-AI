import { useEffect, useState } from "react";
import { FolderKanban, Plus, Trash2, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import PageHeader from "../../components/common/PageHeader";
import AddProjectModal from "../../components/modals/AddProjectModal";
import projectService from "../../services/projectService";
import toast from "react-hot-toast";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      if (Array.isArray(data) && data.length > 0) {
        setProjects(data);
      } else {
        setProjects([
          {
            id: 1,
            name: "SkillSync AI",
            status: "In Progress",
            stack: "React · FastAPI · PostgreSQL",
            description: "Career intelligence SaaS for students, faculty and recruiters aggregating platform signals and computing readiness scores.",
            score: 92,
            github_url: "https://github.com/subhisharma409/SkillSync-AI",
            live_url: "https://subhisharma409.github.io/SkillSync-AI/",
          },
          {
            id: 2,
            name: "Customer Churn Prediction",
            status: "Deployed",
            stack: "Python · scikit-learn · Streamlit",
            description: "End-to-end ML pipeline for churn prediction with SHAP explainability and 91% precision.",
            score: 84,
            github_url: "https://github.com/subhisharma409",
            live_url: "",
          },
          {
            id: 3,
            name: "Spam SMS Detection",
            status: "Completed",
            stack: "Python · NLP · scikit-learn",
            description: "Text classification pipeline with TF-IDF vectorization and hyperparameter optimization.",
            score: 76,
            github_url: "https://github.com/subhisharma409",
            live_url: "",
          },
        ]);
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = async (formData) => {
    try {
      const created = await projectService.createProject(formData);
      setProjects((prev) => [created, ...prev]);
      toast.success("Project added to portfolio!");
    } catch {
      // Local addition fallback
      const localProject = {
        id: Date.now(),
        ...formData,
        score: 82,
      };
      setProjects((prev) => [localProject, ...prev]);
      toast.success("Project added successfully!");
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await projectService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project removed.");
    } catch {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project removed.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Build, document and ship projects that strengthen your target-role profile and boost resume ATS scoring."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus size={16} /> Add Project
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.id || project.name}
            className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FolderKanban size={20} />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      project.status === "Deployed"
                        ? "bg-emerald-50 text-emerald-700"
                        : project.status === "Completed"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {project.status}
                  </span>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    title="Delete project"
                    className="rounded-lg p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">{project.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 line-clamp-3">{project.description}</p>
              <p className="mt-4 text-xs font-medium text-slate-400">{project.stack}</p>

              <div className="mt-5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Resume impact</span>
                  <span className="font-semibold text-slate-700">{project.score || 80}/100</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${project.score || 80}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedProject(project)}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Details
              </button>

              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <FaGithub size={14} /> Repo
                </a>
              )}

              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
                >
                  <ExternalLink size={14} /> Live
                </a>
              )}
            </div>
          </article>
        ))}
      </div>

      <AddProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddProject}
      />

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  {selectedProject.status}
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-900">{selectedProject.name}</h2>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="leading-6">{selectedProject.description}</p>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tech Stack</p>
                <p className="mt-1 font-mono text-xs text-indigo-600">{selectedProject.stack}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800 text-xs">
                <strong>ATS Tip:</strong> Recruiters prioritize projects demonstrating deployment pipelines, cloud hosting, and measurable latency or accuracy gains.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedProject(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;

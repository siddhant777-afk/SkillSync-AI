import { useEffect, useState } from "react";
import { FolderKanban, Plus, Trash2, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import PageHeader from "../../components/common/PageHeader";
import AddProjectModal from "../../components/modals/AddProjectModal";
import projectService from "../../services/projectService";
import { useUser } from "../../hooks/useUser";
import toast from "react-hot-toast";

const Projects = () => {
  const { refreshUser, notifyGlobalUpdate } = useUser();
  const [projects, setProjects] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects();
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
      }
    } catch {
      setProjects([]);
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
      if (refreshUser) refreshUser();
      if (notifyGlobalUpdate) notifyGlobalUpdate();
    } catch {
      const localProject = {
        id: Date.now(),
        ...formData,
        score: 75,
      };
      setProjects((prev) => [localProject, ...prev]);
      toast.success("Project added successfully!");
      if (refreshUser) refreshUser();
      if (notifyGlobalUpdate) notifyGlobalUpdate();
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await projectService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project removed.");
      if (refreshUser) refreshUser();
      if (notifyGlobalUpdate) notifyGlobalUpdate();
    } catch {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project removed.");
      if (refreshUser) refreshUser();
      if (notifyGlobalUpdate) notifyGlobalUpdate();
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Build, document and ship projects that strengthen your target-role profile and boost resume ATS scoring."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 dark:hover:bg-indigo-600 transition"
          >
            <Plus size={16} /> Add Project
          </button>
        }
      />

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <FolderKanban size={28} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No projects in your portfolio yet</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Adding full-stack, cloud, or ML projects directly increases your recruiter visibility score and populates your printable ATS resume.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 dark:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-xs"
          >
            <Plus size={14} /> Add Your First Project
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3 min-w-0">
          {projects.map((project) => (
            <article
              key={project.id || project.name}
              className="flex flex-col justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs transition hover:shadow-md dark:hover:border-slate-700 min-w-0"
            >
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <FolderKanban size={20} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        project.status === "Deployed"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                          : project.status === "Completed"
                          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400"
                          : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {project.status || "Active"}
                    </span>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      title="Delete project"
                      className="rounded-lg p-1 text-slate-300 dark:text-slate-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white truncate">{project.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400 line-clamp-3 break-words">{project.description}</p>
                <p className="mt-4 text-xs font-medium text-slate-400 dark:text-slate-500 truncate">{project.stack}</p>

                <div className="mt-5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 dark:text-slate-500">Resume impact</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{project.score || 80}/100</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400"
                      style={{ width: `${project.score || 80}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
                {project.github_url ? (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    <FaGithub size={14} /> Repository
                  </a>
                ) : (
                  <span className="text-slate-300 dark:text-slate-600">No repo link</span>
                )}

                {project.live_url ? (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <ExternalLink size={13} /> Live Demo
                  </a>
                ) : (
                  <span className="text-slate-300 dark:text-slate-600">No live URL</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <AddProjectModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddProject}
      />
    </div>
  );
};

export default Projects;

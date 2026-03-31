import { useState } from "react";
import { useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Loader2, MessageSquare, PlusCircle, Trash2, X, Heart,
  Image, Video, Type, Send, ChevronDown, ChevronUp,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface ForumPost {
  id: number;
  userId: number;
  authorName: string;
  authorType: string;
  organizationName?: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  opportunityId?: number;
  opportunityTitle?: string;
  likesCount: number;
  hasLiked: boolean;
  commentsCount: number;
  createdAt: string;
}

interface ForumComment {
  id: number;
  postId: number;
  userId: number;
  authorName: string;
  authorType: string;
  content: string;
  createdAt: string;
}

const BASE = "";

async function fetchPosts(): Promise<ForumPost[]> {
  const res = await fetch(`${BASE}/api/posts`, { credentials: "include" });
  if (!res.ok) throw new Error("Error al cargar el foro");
  return res.json();
}

async function createPost(body: {
  title: string; content: string; mediaUrl?: string; mediaType?: string;
}): Promise<ForumPost> {
  const res = await fetch(`${BASE}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Error al publicar");
  }
  return res.json();
}

async function deletePost(postId: number): Promise<void> {
  const res = await fetch(`${BASE}/api/posts/${postId}`, {
    method: "DELETE", credentials: "include",
  });
  if (!res.ok) throw new Error("No se pudo eliminar");
}

async function toggleLike(postId: number): Promise<{ liked: boolean; likesCount: number }> {
  const res = await fetch(`${BASE}/api/posts/${postId}/like`, {
    method: "POST", credentials: "include",
  });
  if (!res.ok) throw new Error("Error al dar like");
  return res.json();
}

async function fetchComments(postId: number): Promise<ForumComment[]> {
  const res = await fetch(`${BASE}/api/posts/${postId}/comments`, { credentials: "include" });
  if (!res.ok) throw new Error("Error al cargar comentarios");
  return res.json();
}

async function createComment(postId: number, content: string): Promise<ForumComment> {
  const res = await fetch(`${BASE}/api/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Error al comentar");
  return res.json();
}

async function deleteComment(postId: number, commentId: number): Promise<void> {
  const res = await fetch(`${BASE}/api/posts/${postId}/comments/${commentId}`, {
    method: "DELETE", credentials: "include",
  });
  if (!res.ok) throw new Error("No se pudo eliminar");
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(dateStr).toLocaleDateString("es-MX", { month: "short", day: "numeric" });
}

function isYouTube(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function toYouTubeEmbed(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  const id = match ? match[1] : "";
  return `https://www.youtube.com/embed/${id}`;
}

function MediaDisplay({ url, type }: { url: string; type?: string }) {
  if (!url) return null;
  if (type === "video" || url.match(/\.(mp4|webm|ogg)$/i)) {
    if (isYouTube(url)) {
      return (
        <div className="aspect-video w-full bg-black">
          <iframe
            src={toYouTubeEmbed(url)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <video src={url} controls className="w-full max-h-[500px] object-cover bg-black" />
    );
  }
  return (
    <img
      src={url}
      alt="Media del post"
      className="w-full max-h-[500px] object-cover"
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}

function CommentsSection({ post, currentUserId }: { post: ForumPost; currentUserId?: number }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => fetchComments(post.id),
    enabled: open,
  });

  const addMutation = useMutation({
    mutationFn: (content: string) => createComment(post.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      setText("");
    },
    onError: () => toast({ title: "Error al comentar", variant: "destructive" }),
  });

  const delMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(post.id, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
    },
  });

  return (
    <div>
      <button
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <MessageSquare className="w-4 h-4" />
        <span>{post.commentsCount} comentario{post.commentsCount !== 1 ? "s" : ""}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="mt-3 border-t border-border/40 pt-3 space-y-3">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mx-auto" />}
          {comments && comments.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">Sin comentarios todavía. ¡Sé el primero!</p>
          )}
          {comments?.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5 group">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                {c.authorName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm text-foreground mr-1.5">{c.authorName}</span>
                <span className="text-sm text-foreground/80 break-words">{c.content}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(c.createdAt)}</p>
              </div>
              {currentUserId === c.userId && (
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
                  onClick={() => delMutation.mutate(c.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {currentUserId ? (
            <form
              className="flex gap-2 mt-2"
              onSubmit={(e) => { e.preventDefault(); if (text.trim()) addMutation.mutate(text); }}
            >
              <Input
                className="h-9 rounded-full text-sm bg-muted/40 border-0 flex-1"
                placeholder="Añade un comentario..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
              />
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 rounded-full shrink-0"
                disabled={addMutation.isPending || !text.trim()}
              >
                {addMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          ) : (
            <p className="text-xs text-center text-muted-foreground pt-1">
              <Link href="/login" className="text-primary hover:underline">Inicia sesión</Link> para comentar
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, currentUserId }: { post: ForumPost; currentUserId?: number }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [liked, setLiked] = useState(post.hasLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(post.id),
    onMutate: () => {
      setLiked((l) => !l);
      setLikesCount((c) => liked ? c - 1 : c + 1);
    },
    onSuccess: (data) => {
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    },
    onError: () => {
      setLiked((l) => !l);
      setLikesCount((c) => liked ? c + 1 : c - 1);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      toast({ title: "Post eliminado" });
    },
  });

  const displayName = post.organizationName || post.authorName;

  return (
    <article className="bg-white dark:bg-card rounded-2xl shadow-md overflow-hidden border border-border/30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-sm shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground leading-tight">{displayName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                className={`text-[10px] px-1.5 py-0 font-medium ${
                  post.authorType === "organization"
                    ? "bg-primary/15 text-primary hover:bg-primary/15"
                    : "bg-secondary/30 text-secondary-foreground hover:bg-secondary/30"
                }`}
              >
                {post.authorType === "organization" ? "Organización" : "Voluntario"}
              </Badge>
              <span className="text-[10px] text-muted-foreground">{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
        {currentUserId === post.userId && (
          <button
            className="text-muted-foreground hover:text-destructive transition-colors p-1"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Media */}
      {post.mediaUrl && (
        <div className="w-full bg-muted/30">
          <MediaDisplay url={post.mediaUrl} type={post.mediaType} />
        </div>
      )}

      {/* Action bar */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-4">
          <button
            className={`flex items-center gap-1 transition-all ${
              liked ? "text-red-500 scale-110" : "text-muted-foreground hover:text-red-400"
            }`}
            onClick={() => currentUserId ? likeMutation.mutate() : null}
            title={!currentUserId ? "Inicia sesión para dar like" : undefined}
          >
            <Heart className={`w-5 h-5 transition-all ${liked ? "fill-red-500" : ""}`} />
          </button>
          <span className="text-sm font-semibold">{likesCount > 0 ? `${likesCount} me gusta` : ""}</span>
        </div>
      </div>

      {/* Caption */}
      <div className="px-4 pb-3">
        <p className="text-sm text-foreground">
          <span className="font-semibold mr-1.5">{displayName}</span>
          <span className="font-bold">{post.title}</span>
          {post.content !== post.title && (
            <span className="text-foreground/80 ml-1">{post.content}</span>
          )}
        </p>
        {post.opportunityTitle && post.opportunityId && (
          <Link href={`/oportunidades/${post.opportunityId}`}>
            <span className="text-xs text-primary font-medium hover:underline mt-1 block">
              🔗 Relacionado con: {post.opportunityTitle}
            </span>
          </Link>
        )}
      </div>

      {/* Comments */}
      <div className="px-4 pb-4">
        <CommentsSection post={post} currentUserId={currentUserId} />
      </div>
    </article>
  );
}

type MediaTabType = "none" | "image" | "video";

export default function Forum() {
  const { data: user } = useGetMe();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaTab, setMediaTab] = useState<MediaTabType>("none");
  const [mediaUrl, setMediaUrl] = useState("");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["forum-posts"],
    queryFn: fetchPosts,
  });

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      setTitle("");
      setContent("");
      setMediaUrl("");
      setMediaTab("none");
      setShowForm(false);
      toast({ title: "Publicado", description: "Tu post fue publicado en el foro." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createMutation.mutate({
      title,
      content,
      mediaUrl: mediaUrl.trim() || undefined,
      mediaType: mediaTab !== "none" && mediaUrl.trim() ? mediaTab : undefined,
    });
  };

  const currentUserId = user?.id;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary/10 py-10 border-b border-primary/20">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary font-bold text-sm mb-3">
                <MessageSquare className="w-4 h-4" /> Foro Comunitario
              </div>
              <h1 className="text-3xl font-display font-extrabold text-foreground mb-1">
                La Comunidad
              </h1>
              <p className="text-muted-foreground text-sm">
                Comparte experiencias, avances e historias de impacto.
              </p>
            </div>
            {user && !showForm && (
              <Button
                size="lg"
                className="rounded-2xl gap-2 shrink-0"
                onClick={() => setShowForm(true)}
              >
                <PlusCircle className="w-4 h-4" />
                Publicar
              </Button>
            )}
            {!user && (
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-2xl shrink-0">
                  Inicia sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-xl">
        {/* New post form */}
        {showForm && user && (
          <div className="bg-white dark:bg-card rounded-2xl shadow-lg border border-border/30 mb-6 overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-sm">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="font-semibold text-sm">{user.name}</span>
              </div>
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setShowForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Título del post..."
                  className="h-11 rounded-xl bg-muted/30 border-0 font-medium"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                />
              </div>
              <div>
                <Textarea
                  placeholder="Cuenta tu experiencia, logro o lo que quieras compartir..."
                  className="min-h-[110px] rounded-xl bg-muted/30 border-0 resize-none text-sm"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">{content.length}/2000</p>
              </div>

              {/* Media type selector */}
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Añadir media (opcional)
                </Label>
                <div className="flex gap-2">
                  {([
                    { key: "none", icon: <Type className="w-4 h-4" />, label: "Solo texto" },
                    { key: "image", icon: <Image className="w-4 h-4" />, label: "Foto" },
                    { key: "video", icon: <Video className="w-4 h-4" />, label: "Video" },
                  ] as { key: MediaTabType; icon: JSX.Element; label: string }[]).map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setMediaTab(tab.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        mediaTab === tab.key
                          ? "bg-primary text-white shadow"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {mediaTab !== "none" && (
                <Input
                  placeholder={
                    mediaTab === "image"
                      ? "URL de la imagen (https://...)"
                      : "URL del video o link de YouTube"
                  }
                  className="h-10 rounded-xl bg-muted/30 border-0 text-sm"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              )}

              <div className="flex gap-2 justify-end pt-1">
                <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl px-5"
                  disabled={createMutation.isPending || !title.trim() || !content.trim()}
                >
                  {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                  Publicar
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Feed */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-5">
              <MessageSquare className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h2 className="text-xl font-display font-bold mb-2">El foro está vacío</h2>
            <p className="text-muted-foreground text-sm">¡Sé el primero en compartir algo con la comunidad!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

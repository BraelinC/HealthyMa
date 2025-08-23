import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import InlineLessonEditor from "@/components/community/InlineLessonEditor";
// Types will be inferred from the API response

export default function LessonEditor() {
  const { communityId, lessonId } = useParams();
  const [, setLocation] = useLocation();

  // Fetch the specific lesson data
  const { data: courses } = useQuery({
    queryKey: [`/api/communities/${communityId}/courses`],
  });

  // Find the lesson in the courses data
  const lesson = courses && Array.isArray(courses) 
    ? courses.flatMap((course: any) => 
        (course.modules || []).flatMap((module: any) => module.lessons || [])
      ).find((l: any) => l.id === parseInt(lessonId || '0'))
    : null;

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
          <p className="text-gray-400">The lesson you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <InlineLessonEditor
        lesson={lesson}
        communityId={communityId || ''}
        courseId={lesson.course_id}
        isCreator={true}
        onClose={() => setLocation(`/community/${communityId}`)}
      />
    </div>
  );
}
-- Seed workout data
INSERT INTO workouts (name, description, duration_minutes, difficulty_level, condition_tags, exercise_list) VALUES 
('Morning Stretch & Mobility', 'Gentle stretching routine perfect for beginners and those with back pain or posture issues', 15, 'beginner', ARRAY['back pain', 'posture', 'flexibility'], '[{"name":"Cat-Cow Stretch","reps":"10 reps","rest":"30s"},{"name":"Child''s Pose","duration":"1 min","rest":"30s"},{"name":"Neck Rolls","reps":"5 each side","rest":"30s"},{"name":"Shoulder Rolls","reps":"10 reps","rest":"30s"}]'::jsonb),

('Beginner Full Body', 'Basic full body workout for fitness beginners, no equipment needed', 20, 'beginner', ARRAY['general fitness'], '[{"name":"Bodyweight Squats","reps":"12 reps","rest":"45s"},{"name":"Wall Push-ups","reps":"10 reps","rest":"45s"},{"name":"Standing Lunges","reps":"10 each leg","rest":"45s"},{"name":"Plank Hold","duration":"20s","rest":"60s"}]'::jsonb),

('Core Strengthening', 'Focused core workout to improve posture and reduce back pain', 15, 'beginner', ARRAY['back pain', 'posture', 'core'], '[{"name":"Dead Bug","reps":"12 reps","rest":"45s"},{"name":"Bird Dog","reps":"10 each side","rest":"45s"},{"name":"Modified Plank","duration":"30s","rest":"60s"},{"name":"Bridge Hold","duration":"30s","rest":"45s"}]'::jsonb),

('Cardio & Strength Mix', 'Intermediate level workout combining cardio and strength training', 25, 'intermediate', ARRAY['weight loss', 'general fitness'], '[{"name":"Jumping Jacks","duration":"45s","rest":"30s"},{"name":"Push-ups","reps":"15 reps","rest":"45s"},{"name":"Mountain Climbers","duration":"30s","rest":"45s"},{"name":"Squats","reps":"20 reps","rest":"45s"},{"name":"Burpees","reps":"10 reps","rest":"60s"}]'::jsonb),

('Yoga for Flexibility', 'Gentle yoga sequence to improve flexibility and reduce stress', 20, 'beginner', ARRAY['flexibility', 'stress', 'back pain'], '[{"name":"Downward Dog","duration":"1 min","rest":"30s"},{"name":"Warrior I","duration":"45s each side","rest":"30s"},{"name":"Triangle Pose","duration":"45s each side","rest":"30s"},{"name":"Seated Forward Bend","duration":"1 min","rest":"30s"}]'::jsonb),

('Upper Body Strength', 'Focused upper body workout for building strength', 20, 'intermediate', ARRAY['muscle gain', 'strength'], '[{"name":"Push-ups","reps":"15 reps","rest":"60s"},{"name":"Tricep Dips","reps":"12 reps","rest":"60s"},{"name":"Pike Push-ups","reps":"10 reps","rest":"60s"},{"name":"Diamond Push-ups","reps":"8 reps","rest":"60s"}]'::jsonb)
ON CONFLICT DO NOTHING;
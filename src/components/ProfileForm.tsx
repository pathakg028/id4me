import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setProfileForm, setProfileFormLoading } from "../features/counter/ProfileFormSlice";


const schema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    dob: z.string().refine(
        (val) => {
            const date = new Date(val);
            return !isNaN(date.getTime());
        },
        { message: "Invalid date of birth" }
    ),
    gender: z.enum(["male", "female", "other"]).optional(),
});

type ProfileFormData = z.infer<typeof schema>;

interface ProfileFormProps {
    className?: string;
}
const ProfileForm: React.FC<ProfileFormProps> = ({ className }) => {
    const dispatch = useAppDispatch();
    const loading = useAppSelector(state => state.profileForm.loading);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: ProfileFormData) => {
        dispatch(setProfileFormLoading(true));
        // Simulate async operation (e.g., API call)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        dispatch(setProfileForm(data));
        dispatch(setProfileFormLoading(false));
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={`max-w-md mx-auto p-4 border rounded-md shadow-md flex flex-col gap-4 ${className}`}>
            <div>
                <label className="block mb-1 font-medium">Full Name</label>
                <input
                    {...register("fullName")}
                    className={`w-full border rounded px-3 py-2 ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName.message}</p>}
            </div>
            <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                    {...register("email")}
                    type="email"
                    className={`w-full border rounded px-3 py-2 ${errors.email ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div>
                <label className="block mb-1 font-medium">Date of Birth</label>
                <input
                    {...register("dob")}
                    type="date"
                    className={`w-full border rounded px-3 py-2 ${errors.dob ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.dob && <p className="text-red-500 text-sm">{errors.dob.message}</p>}
            </div>
            <div>
                <label className="block mb-1 font-medium">Gender</label>
                <select
                    {...register("gender")}
                    className={`w-full border rounded px-3 py-2 ${errors.gender ? "border-red-500" : "border-gray-300"}`}
                >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
            </div>
            <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={loading}
            >
                {loading ? "Submitting..." : "Submit"}
            </button>
        </form>
    );
};

export default ProfileForm;
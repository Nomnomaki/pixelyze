"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary once
const initCloudinary = () => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not properly configured");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
};

/**
 * Populates user information in the query
 */
const populateUser = (query: any) =>
  query.populate({
    path: "author",
    model: User,
    select: "_id firstName lastName clerkId",
  });

interface AddImageParams {
  image: any;
  userId: string;
  path: string;
}

interface UpdateImageParams {
  image: any;
  userId: string;
  path: string;
}

/**
 * Adds a new image
 */
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    await connectToDatabase();

    const author = await User.findById(userId);
    if (!author) {
      throw new Error("User not found");
    }

    const newImage = await Image.create({
      ...image,
      author: author._id,
    });

    revalidatePath(path);
    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error);
  }
}

/**
 * Updates an existing image
 */
export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image._id);
    if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
      throw new Error("Unauthorized or image not found");
    }

    const updatedImage = await Image.findByIdAndUpdate(
      imageToUpdate._id,
      image,
      { new: true }
    );

    revalidatePath(path);
    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error);
  }
}

/**
 * Deletes an image
 */
export async function deleteImage(imageId: string) {
  try {
    await connectToDatabase();
    await Image.findByIdAndDelete(imageId);
  } catch (error) {
    handleError(error);
  } finally {
    redirect("/");
  }
}

/**
 * Gets an image by ID
 */
export async function getImageById(imageId: string) {
  try {
    await connectToDatabase();

    const image = await populateUser(Image.findById(imageId));
    if (!image) throw new Error("Image not found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error);
  }
}

interface GetAllImagesParams {
  limit?: number;
  page: number;
  searchQuery?: string;
}

/**
 * Gets all images with pagination and search
 */
export async function getAllImages({
  limit = 9,
  page = 1,
  searchQuery = "",
}: GetAllImagesParams) {
  try {
    await connectToDatabase();

    // Initialize Cloudinary
    try {
      initCloudinary();
    } catch (error) {
      console.error("Cloudinary initialization failed:", error);
      throw new Error("Failed to initialize image service");
    }

    let expression = "folder=aniket_pixelyze";
    if (searchQuery) {
      expression += ` AND ${searchQuery}`;
    }

    // Fetch from Cloudinary
    let resources;
    try {
      const result = await cloudinary.search.expression(expression).execute();
      resources = result.resources;
    } catch (error) {
      console.error("Cloudinary search failed:", error);
      throw new Error("Failed to fetch images from cloud storage");
    }

    const resourceIds = resources.map((resource: any) => resource.public_id);
    const query = searchQuery ? { publicId: { $in: resourceIds } } : {};
    const skipAmount = (Number(page) - 1) * limit;

    // Database queries
    const [images, totalImages, savedImages] = await Promise.all([
      populateUser(Image.find(query))
        .sort({ updatedAt: -1 })
        .skip(skipAmount)
        .limit(limit),
      Image.find(query).countDocuments(),
      Image.find().countDocuments(),
    ]);

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    handleError(error);
  }
}

interface GetUserImagesParams {
  limit?: number;
  page: number;
  userId: string;
}

/**
 * Gets images for a specific user
 */
export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: GetUserImagesParams) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    const [images, totalImages] = await Promise.all([
      populateUser(Image.find({ author: userId }))
        .sort({ updatedAt: -1 })
        .skip(skipAmount)
        .limit(limit),
      Image.find({ author: userId }).countDocuments(),
    ]);

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

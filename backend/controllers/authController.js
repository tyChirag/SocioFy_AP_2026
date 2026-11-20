import prisma from "../prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
        const {
            fullName,
            collegeEmail,
            collegeName,
            department,
            academicYear,
            password,
            confirmPassword,
            termsAccepted
        } = req.body;

        // 1. Check required fields
        if (
            !fullName ||
            !collegeEmail ||
            !collegeName ||
            !department ||
            !academicYear ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // 2. Validate email format
        const email = collegeEmail.trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        // 3. Check password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

        // 4. Check password confirmation
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        // 5. Check terms and conditions
        if (termsAccepted !== true) {
            return res.status(400).json({
                success: false,
                message: "Please accept the Terms and Conditions"
            });
        }

        // 6. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                collegeEmail: email
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "This college email is already registered"
            });
        }

        // 7. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 8. Create user in database
        const newUser = await prisma.user.create({
            data: {
                fullName: fullName.trim(),
                collegeEmail: email,
                collegeName: collegeName.trim(),
                department,
                academicYear,
                password: hashedPassword,
                termsAccepted: true
            },
            select: {
                id: true,
                fullName: true,
                collegeEmail: true,
                collegeName: true,
                department: true,
                academicYear: true,
                bio: true,
                profileImage: true,
                skills: true,
                interests: true,
                linkedinUrl: true,
                githubUrl: true,
                portfolioUrl: true,
                isVerified: true,
                createdAt: true
            }
        });

        // Generate JWT token with full user identity payload
        const token = jwt.sign(
            {
                userId: newUser.id,
                id: newUser.id,
                fullName: newUser.fullName,
                collegeEmail: newUser.collegeEmail
            },
            process.env.JWT_SECRET || "sociofy_secret_jwt_key_2026",
            { expiresIn: "7d" }
        );

        // 9. Send response
        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            user: newUser
        });

    } catch (error) {
        console.error("Registration error:", error);

        // Handle duplicate email race conditions
        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                message: "This college email is already registered"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { collegeEmail, email, password } = req.body;

        // Support either collegeEmail or email parameter
        const emailInput = (collegeEmail || email || "").trim().toLowerCase();

        // 1. Validate required inputs
        if (!emailInput || !password) {
            return res.status(400).json({
                success: false,
                message: "College email and password are required"
            });
        }

        // 2. Find user in database
        const user = await prisma.user.findUnique({
            where: {
                collegeEmail: emailInput
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid college email or password"
            });
        }

        // 3. Compare password with bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid college email or password"
            });
        }

        // 4. Generate JWT token with full identity payload
        const token = jwt.sign(
            {
                userId: user.id,
                id: user.id,
                fullName: user.fullName,
                collegeEmail: user.collegeEmail
            },
            process.env.JWT_SECRET || "sociofy_secret_jwt_key_2026",
            { expiresIn: "7d" }
        );

        // 5. Return safe user information (never return password or hash)
        const safeUser = {
            id: user.id,
            fullName: user.fullName,
            collegeEmail: user.collegeEmail,
            collegeName: user.collegeName,
            department: user.department,
            academicYear: user.academicYear,
            bio: user.bio,
            profileImage: user.profileImage,
            skills: user.skills,
            interests: user.interests,
            linkedinUrl: user.linkedinUrl,
            githubUrl: user.githubUrl,
            portfolioUrl: user.portfolioUrl,
            isVerified: user.isVerified,
            createdAt: user.createdAt
        };

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: safeUser
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
